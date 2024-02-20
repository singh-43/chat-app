import Icons from './Icons';
import Avatar from './Avatar';
import Image from 'next/image';
import MessageMenu from './MessageMenu';
import { db } from '@/firebase/firebase';
import { GoChevronDown } from "react-icons/go";
import { useAuth } from '@/context/authContext';
import { IoCheckmarkDone } from "react-icons/io5";
import React, { forwardRef, useEffect, useState } from 'react';
import ImageViewer from "react-simple-image-viewer";
import { useChatContext } from '@/context/chatContext';
import DeleteMgsPopup from './popup/DeleteMessagePopup';
import { timeHelper, dateHelper } from '@/utils/helpers';
import { Timestamp, arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { DELETED_FOR_ME, DELETED_FOR_EVERYONE } from '@/utils/constants';

const Message = ({ message, updateLastMessage, index, lastDate }) => {

    const { currentUser } = useAuth();
    const self = message?.sender === currentUser?.uid;
    const [showMenu, setShowMenu] = useState(false);
    const [diff, setDiff] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const { data, users, imageViewer, setImageViewer, setEditMsg,
        setAttachmentPreview } = useChatContext();
    
    const timestamp = new Timestamp(
        message.date?.seconds,
        message.date?.nanoseconds
    );

    const date = timestamp.toDate();

    const deletePopupHandler = () => {
        setShowDeletePopup(true);
        setShowMenu(false);
    }

    const deleteMessage = async (action) => {
        try {
            setEditMsg(null);
            const messageId = message.id;
            const chatRef = doc(db, "chats", data.chatId)
            const chatDoc = await getDoc(chatRef);

            const updatedMessages = chatDoc.data().messages.map((message) => {
                if(message.id === messageId) {
                    if(action === DELETED_FOR_ME){
                        if(message.deletedInfo){
                            message.deletedInfo = {
                                deletedForEveryone: true
                            }
                        }else{
                            message.deletedInfo = {
                                [currentUser.uid]: DELETED_FOR_ME
                            }
                        }
                    }
                    if(message.id === messageId) {
                        if(action === DELETED_FOR_EVERYONE){
                            message.deletedInfo = {
                                deletedForEveryone: true
                            }
                        }
                    }
                }
                return message;
            });
            
            await updateDoc(chatRef, { messages: updatedMessages });
            updateLastMessage(messageId, action);
            setShowDeletePopup(false);
        } catch (error) {
            console.error(error);
        }
    }   

    return (
        <>
            {/* {
                ((dateHelper(date) !== lastDate[index - 1]) || index === 0) && (
                <div className='flex justify-center text-c3 text-sm mb-5'>
                    <div className='bg-c1/[0.5] py-[6px] rounded-xl w-[145px] font-semibold text-center'>
                        {dateHelper(date)}
                    </div>
                </div>)
            } */}
            <div className={`mb-5 max-w-[75%] ${self ? "self-end" : ""}`}>
                {showDeletePopup && (<DeleteMgsPopup 
                    self={self}
                    noHeader={true}
                    shortHeight={true}
                    className="DeleteMsgPopup"
                    deleteMessage={deleteMessage}
                    onHide={() =>setShowDeletePopup(false)}
                />)}
                <div className={`flex items-end gap-3 mb-1 ${self ? "justify-start flex-row-reverse"
                    : ""}`}>
                    <Avatar size="small" user={self ? currentUser : users[data?.user.uid]} 
                        className="mb-4"
                    />
                    <div className={`${message.img ? "px-2 pt-2 pb-[4px]" : "px-[8px] pt-[8px] pb-[4px]"} group flex flex-col rounded-md
                        relative break-all bg-c5 ${self ? "rounded-br-sm" : 
                        "rounded-bl-sm"}`}>
                        {message.img && (
                            <div 
                                className='mb-[5px]'
                            >
                                <Image 
                                    src={message.img}
                                    width={220}
                                    height={220}
                                    alt={message?.text || ""}
                                    className='rounded-sm z-10 max-w-[220px] max-h-[220px] cursor-pointer'
                                    onClick={() => {
                                        setImageViewer({
                                            msgId: message.id,
                                            url: message.img
                                        })
                                    }}
                                />
                                {
                                    imageViewer && imageViewer.msgId === message.id && (
                                        <ImageViewer
                                            src={[imageViewer.url]}
                                            currentIndex={0}
                                            disableScroll={false}
                                            closeOnClickOutside={true}
                                            onClose={() => setImageViewer(null)}
                                        />
                                    )
                                }
                            </div>
                        )}
                        {message.text && (
                            <div className={`text-md z-10 ${ message.img ? "max-w-[220px]" : null }`}>
                                {message.text}
                            </div>
                        )}
                        <div className={`flex items-center gap-1 mt-[1px] ${ self ? "justify-end" : "justify-end" }`}>
                            {message?.edited && (<div className="text-c3 text-xs">
                                {`Edited`}
                            </div>)}
                            <div className="text-c3 text-xs">{timeHelper(date)}</div>
                            {self && (<div>
                                <IoCheckmarkDone color={`${ message.read ? "#2e58f0" : "white"}`} size={18} />
                            </div>)}
                        </div>

                        <div className={`${showMenu ? "" : "hidden"} group-hover:flex absolute top-0 bg-c5 ${self ? "rounded-l-md -left-[28px]" : "rounded-r-md -right-[28px]"}`}
                            onClick={() => {
                                setShowMenu(true);
                                const timestamp = new Timestamp(
                                    message.date?.seconds,
                                    message.date?.nanoseconds,
                                )
                                const date = timestamp.toDate();
                                const now = new Date();
                                setDiff(now.getTime() - date?.getTime());
                            }}
                        >
                            <Icons
                                size="small"
                                icon={<GoChevronDown size={22} className="text-c3" />}
                                className="hover:bg-inherit my-[2px]"
                            />
                            {
                                showMenu && (
                                    <MessageMenu 
                                        self={self}
                                        showMenu={showMenu}
                                        setEditMsg={() => {
                                            setEditMsg(message);
                                            setAttachmentPreview(message.img);
                                        }}
                                        setShowMenu={setShowMenu}
                                        deletePopupHandler={deletePopupHandler}
                                        diff={diff}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Message;