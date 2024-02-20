import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { db } from '@/firebase/firebase';
import { arrayRemove, arrayUnion, deleteField, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import BlockMsgPopUp from './popup/BlockMessagePopUp';
import ClearDeleteChatPopUp from './popup/ClearDeleteChatPopup';

const ChatMenu = ({ setShowMenu }) => {

    const { currentUser } = useAuth();
    const [showBlockPopup, setShowBlockPopup] = useState(false);
    const [clearchatPopUp, setClearChatPopUp] = useState(false);
    const [deleteChatPopUp, setDeleteChatPopUp] = useState(false);
    const { data, users, chats, dispatch, setSelectedChat, selectedChat, setEditMsg } = useChatContext();

    const handleClickAway = () => {
        setShowMenu(false);
    }

    const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => u === data.user.uid);

    const handleBlock = async (action) => {
        if(action === "block"){
            await updateDoc(doc(db, "users", currentUser.uid), {
                blockedUsers: arrayUnion(data.user.uid),
            })
        }
        if(action === "unblock"){
            await updateDoc(doc(db, "users", currentUser.uid), {
                blockedUsers: arrayRemove(data.user.uid),
            })
        }
    }

    const handleClearChat = async () => {
        try {
            const chatRef = doc(db, "chats", data.chatId);
            const chatDoc = await getDoc(chatRef);

            const updatedMessages = chatDoc.data().messages.map((message) => {
                message.deleteChatInfo = {
                    ...message.deleteChatInfo, 
                    [currentUser.uid]: true
                }
                return message;
            })

            await updateDoc(chatRef, {
                messages: updatedMessages,
            });

            await updateDoc(doc(db, "userChats", currentUser.uid),{
                [data.chatId + ".lastMessage"]: deleteField(),
                // [data.chatId + ".date"]: serverTimestamp(),
            });

        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteUser = async () => {
        try {
            const chatRef = doc(db, "chats", data.chatId);
            const chatDoc = await getDoc(chatRef);

            const updatedMessages = chatDoc.data().messages.map((message) => {
                message.deleteChatInfo = {
                    ...message.deleteChatInfo, 
                    [currentUser.uid]: true
                }
                return message;
            })

            await updateDoc(chatRef, {
                messages: updatedMessages,
            });

            await updateDoc(doc(db, "userChats", currentUser.uid), {
                [data.chatId + ".chatDeleted"]: true,
                [data.chatId + ".lastMessage"]: deleteField(),
                [data.chatId + ".date"]: deleteField(),
            });

            const filteredChats = Object.entries(chats || {})
                .filter(([id, chat]) => id !== data.chatId)
                .sort((a, b) => b[1].date - a[1].date);

            if(filteredChats.length > 0){
                setSelectedChat(filteredChats[0]?.[1]?.userInfo);
                dispatch({type: "CHANGE_USER", payload: filteredChats[0]?.[1]?.userInfo});
            }else{
                dispatch({type: "EMPTY"});
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <ClickAwayListener onClickAway={handleClickAway}>
                <div className='w-[200px] absolute top-[70px] right-5 bg-c0 z-50 rounded-md
                    overflow-hidden'>
                    {showBlockPopup && (<BlockMsgPopUp
                        self={self}
                        noHeader={true}
                        shortHeight={true}
                        className="BlockMsgPopUp"
                        handleBlock={handleBlock}
                        handleClearChat={handleClearChat}
                        onHide={() => {
                            setShowMenu(false);
                            setShowBlockPopup(false)
                        }}
                    />)}
                    {(clearchatPopUp || deleteChatPopUp) && (<ClearDeleteChatPopUp
                        self={self}
                        noHeader={true}
                        shortHeight={true}
                        className="ClearDeleteChatPopUp"
                        clearchatPopUp={clearchatPopUp}
                        handleClearChat={handleClearChat}
                        handleDeleteUser={handleDeleteUser}
                        onHide={() => {
                            setShowMenu(false);
                            setClearChatPopUp(false);
                            setDeleteChatPopUp(false);
                        }}
                    />)}
                    <ul className='flex flex-col py-2 px-2'>
                        { currentUser.uid !== selectedChat.uid && (<li className='flex items-center py-3 px-5 rounded-md hover:bg-black cursor-pointer'
                            onClick={(e) => {
                                e.stopPropagation();
                                if(!isUserBlocked){
                                    setShowBlockPopup(true)
                                }else{
                                    handleBlock("unblock")
                                    setShowMenu(false);
                                }
                                setEditMsg(null);
                            }}
                        >
                            { isUserBlocked ? "Unblock User" : "Block User"}
                        </li>)}
                        <li className='flex items-center py-3 px-5 rounded-md hover:bg-black cursor-pointer'
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditMsg(null);
                                setClearChatPopUp(true);
                            }}
                        >
                            Clear Chat
                        </li>
                        <li className='flex items-center py-3 px-5 rounded-md hover:bg-black cursor-pointer'
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditMsg(null);
                                setDeleteChatPopUp(true);
                            }}
                        >
                            Delete User
                        </li>
                    </ul>
                </div>
            </ClickAwayListener>
        </>
    )
}

export default ChatMenu;