import React,{ useEffect, useRef, useState } from 'react';
import { useChatContext } from '@/context/chatContext';
import { Timestamp, arrayRemove, arrayUnion, collection, deleteField, 
    doc, getDoc, onSnapshot, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { RiSearch2Line } from "react-icons/ri";
import Avatar from './Avatar';
import { useAuth } from '@/context/authContext';
import { formatDate } from '@/utils/helpers';
import { query } from 'firebase/database';
import { FaImage } from "react-icons/fa6";
import { IoCheckmarkDone } from "react-icons/io5";
import { TiDocumentText } from "react-icons/ti";
import { PiFileZipFill } from "react-icons/pi";
import { BsFiletypeExe } from "react-icons/bs";
import { IoVideocam } from "react-icons/io5";
import { MdLibraryMusic } from "react-icons/md";
import { DELETED_FOR_ME } from '@/utils/constants';

const Chats = () => {

    const { currentUser } = useAuth();
    const isUsersFetchedRef = useRef(false);
    const [search, setSearch] = useState("");
    const isBlockExecutedRef = useRef(false);
    const [unreadMsgs, setUnreadMsgs] = useState({});
    const [readStatus, setReadStatus] = useState({});
    const { users, setUnread, unread, resetFooterStates, 
            data, dispatch, setUsers, chats, setChats,
            selectedChat, setSelectedChat } = useChatContext();

    useEffect(() => {
        resetFooterStates();
        //eslint-disable-next-line
    }, [data?.chatId])
    
    useEffect(() => {
        onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = {}
            snapshot.forEach((doc) => {
                updatedUsers[doc.id] = doc.data();
            });
            setUsers(updatedUsers);
            if(!isBlockExecutedRef.current) {
                isUsersFetchedRef.current = true;
            }
        })
        //eslint-disable-next-line
    }, [])

    useEffect(() => {

        const documentIds = Object.keys(chats);
        if(documentIds.length === 0){
            return;
        }
        const q = query(
            collection(db, "chats"),
            where("__name__", "in", documentIds)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            let msgs = {}, readM = {};
            snapshot.forEach((doc) => {
                if(doc.id !== data.chatId){
                    msgs[doc.id] = doc.data().messages.filter((m) => m?.read === false && m?.sender !== currentUser.uid && !m?.deletedInfo?.deletedForEveryone)
                }
                readM[doc.id] = doc.data().messages.filter((m) => m?.read === false && m?.sender === currentUser.uid && m?.deletedInfo?.[currentUser.uid] !== DELETED_FOR_ME && !m?.deletedInfo?.deletedForEveryone && !m?.deleteChatInfo?.[currentUser.uid])
            })
            Object.keys(readM || {})?.map(c => {
                if(readM[c]?.lenght < 1) {
                    delete readM[c];
                }
            }) 
            Object.keys(msgs || {})?.map(c => {
                if(msgs[c]?.lenght < 1) {
                    delete msgs[c];
                }
            }) 
            setUnreadMsgs(msgs);
            setReadStatus(readM);
        })
        return () => unsub();
        //eslint-disable-next-line
    }, [chats, selectedChat])

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                if(doc.exists()){
                    const data = doc.data();
                    setChats(data);
                    // if(!isBlockExecutedRef.current && isUsersFetchedRef.current && users){
                    //     const firstChat = Object.values(data).filter((chat) => !chat.hasOwnProperty("chatDeleted")).sort((a, b) => b.date - a.date)[0]
                    //     if(firstChat){
                    //         const user = users[firstChat?.userInfo?.uid]
                    //         handleSelect(user);
                    //         const chatId = currentUser?.uid > user?.uid ? currentUser?.uid + user?.uid : user?.uid + currentUser?.uid;
                    //         readChat(chatId);
                    //     }
                    //     isBlockExecutedRef.current = true;
                    // }
                }
            })
        }
        currentUser.uid && getChats();
        //eslint-disable-next-line
    }, [ isBlockExecutedRef.current, users])

    const filteredChats = Object.entries(chats || {})
        .filter(([, chat]) => !chat.hasOwnProperty("chatDeleted"))
        .filter(([, chat]) => chat.userInfo?.displayName?.toLowerCase().includes(search.toLowerCase()) 
        || chat?.lastMessage?.text?.toLowerCase().includes(search.toLowerCase()) )
        .sort((a, b) => b[1]?.date - a[1]?.date);
        // .sort((a, b) => (!b[1]?.date - !a[1]?.date) || b[1]?.date?.toString()?.localeCompare(a[1].date?.toString()) );

    useEffect(() => {
        const runThis = async () => {
            await updateDoc(doc(db, "users", selectedChat?.uid),{
                selectedChat: arrayUnion(currentUser.uid),
            });
        }
        selectedChat && runThis();
        //eslint-disable-next-line
    }, [selectedChat])

    const readChat = async (chatId) => {
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);

        let updatedMessages = chatDoc.data()?.messages?.map((m) => {
            if (m?.read === false && m?.sender !== currentUser?.uid) {
                m.read = true;
            }
            return m;
        });

        await updateDoc(chatRef, {
            messages: updatedMessages,
        });
    };

    const handleSelect = async (user, selectedChatId) => {
        {selectedChat && await updateDoc(doc(db, "users", selectedChat?.uid),{
            selectedChat: arrayRemove(currentUser.uid),
        })}
        setSelectedChat(user);
        dispatch({type: 'CHANGE_USER', payload: user});
        if(unreadMsgs?.[selectedChatId]?.length > 0){
            setUnread(unreadMsgs?.[selectedChatId]?.length);
            readChat(selectedChatId);
        } else {
            setUnread(null);
        }
    }

    return (
        <div className='flex flex-col h-full select-none'>
            <div className='shrink-0 sticky -top-[20px] z-10 flex justify-center w-full
                bg-c2 py-5'>
                <RiSearch2Line 
                    className='absolute top-9 left-6 text-c3'
                />
                <input 
                    type='text'
                    placeholder='Search User...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-[350px] h-12 rounded-xl bg-c1/[0.5] pl-11 pr-5
                    placeholder:text-c3 outline-none text-base'
                />
            </div>
            <ul className='flex flex-col w-full my-5 gap-[2px]'>
                {
                    Object.keys(chats || {}).length > 0 && 
                    (
                        filteredChats?.length > 0 &&
                        // filteredChats?.length > 0 ?
                            filteredChats?.map((chat) => {
                                
                                const timestamp = new Timestamp(
                                    chat[1].date?.seconds,
                                    chat[1].date?.nanoseconds
                                    );
                                    
                                const date = timestamp.toDate();
                                    
                                const user = users[chat[1].userInfo?.uid];

                                const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => u === user?.uid);

                                return (
                                    <li className={`h-[80px] flex items-center gap-4 rounded-3xl
                                        hover:bg-c1 p-4 cursor-pointer ${selectedChat?.uid === user?.uid ? "bg-c1" : ""}`}
                                        key={chat[0]}    
                                        onClick={() => handleSelect(user, chat[0])}
                                    >
                                        <Avatar user={user} size="x-large" />
                                        <div className='flex flex-col gap-1 grow relative'>
                                            <span className='text-white text-base flex items-center
                                                justify-between'>
                                                <div className='font-medium'>{`${user.displayName} ${ currentUser?.uid === user?.uid ? "(You)" : "" }`}</div>
                                                {( chat[1]?.lastMessage?.text || chat[1]?.lastMessage?.img ) && <div className='text-c3 text-xs'>{formatDate(date)}</div>}
                                            </span>
                                            <div className={`text-sm text-c3 flex items-center gap-1 ${ unreadMsgs?.[chat[0]]?.length> 0 ? "max-w-[90%]" : ""}`}>
                                                {
                                                    (isUserBlocked && "You blocked this user.")||
                                                    ((chat[1]?.lastMessage?.text || chat[1]?.lastMessage?.type) && (
                                                        <>
                                                            {
                                                                chat[1]?.lastMessage?.sender === currentUser?.uid &&
                                                                <p className={`flex`}>
                                                                    <IoCheckmarkDone 
                                                                        color={`${ !readStatus?.[chat[0]]?.length ? "#2e58f0" : "white"}`} 
                                                                    size={18} />
                                                                </p>}
                                                            { chat[1]?.lastMessage?.type === "image" && <p className='flex items-center'><FaImage size={16} /></p>}
                                                            { chat[1]?.lastMessage?.type === "audio" && <p className='flex items-center'><MdLibraryMusic size={20} /></p>}
                                                            { chat[1]?.lastMessage?.type === "video" && <p className='flex items-center'><IoVideocam size={20} /></p>}
                                                            { (chat[1]?.lastMessage?.extName === "ppt" || chat[1]?.lastMessage?.extName === "doc" || chat[1]?.lastMessage?.extName === "docs" || chat[1]?.lastMessage?.extName === "docx" || chat[1]?.lastMessage?.extName === "ppt" || chat[1]?.lastMessage?.extName === "pptx" || chat[1]?.lastMessage?.extName === "txt" || chat[1]?.lastMessage?.extName === "xls" || chat[1]?.lastMessage?.extName === "xlsx") && <p className='flex items-center'><TiDocumentText size={20} /></p>}
                                                            { chat[1]?.lastMessage?.extName === "zip" && <p className='flex items-center'><PiFileZipFill size={20} /></p>}
                                                            { chat[1]?.lastMessage?.extName === "exe" && <p className='flex items-center'><BsFiletypeExe size={20} /></p>}
                                                            <p className='line-clamp-1 break-all'>
                                                                { chat[1]?.lastMessage?.text?.trim() ? chat[1]?.lastMessage?.text : chat[1]?.lastMessage?.type === "image" ? "image" : chat[1]?.lastMessage?.type === "video" ? "video" : chat[1]?.lastMessage?.name }
                                                            </p>
                                                        </>
                                                    )) || "Send message"}
                                            </div>
                                            { !!unreadMsgs?.[chat[0]]?.length && (<span className='absolute right-0 top-7 min-w-[20px] h-5 rounded-full
                                                bg-red-500 flex justify-center items-center text-sm'>
                                                {unreadMsgs?.[chat[0]]?.length}
                                            </span>)}
                                        </div>
                                    </li>
                                )
                            })
                            // :
                            // <div className='flex justify-center items-center text-white'>No results found for &#39;{search}&#39;</div>
                    )
                }
            </ul>
        </div>
    )
}

export default Chats;