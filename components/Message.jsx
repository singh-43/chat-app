import Icons from './Icons';
import Avatar from './Avatar';
import Image from 'next/image';
import { saveAs } from "file-saver";
import MessageMenu from './MessageMenu';
import { db, storage } from '@/firebase/firebase';
import { FaDownload } from "react-icons/fa6";
import { GoChevronDown } from "react-icons/go";
import { useAuth } from '@/context/authContext';
import { IoCheckmarkDone } from "react-icons/io5";
import ImageViewer from "react-simple-image-viewer";
import { useChatContext } from '@/context/chatContext';
import DeleteMgsPopup from './popup/DeleteMessagePopup';
import React, { forwardRef, useEffect, useState } from 'react';
import { DELETED_FOR_ME, DELETED_FOR_EVERYONE } from '@/utils/constants';
import { timeHelper, dateHelper, handleDragStart, openInNewTab } from '@/utils/helpers';
import { Timestamp, arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import Tooltip from './Tooltip';
import AudioPlayer from './AudioPlayer/AudioPlayer';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';

const Message = ({ message, updateLastMessage, index, lastDate }) => {

    const imageLoader = ({ src, width, quality }) => {
        return `https://example.com/${src}?w=${width}&q=${quality || 75}`
    }

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

    const downloadMedia = (e, message) => {
        console.clear();
        console.log("message?.img", message?.url);
        console.log("message?.fileName", message?.name);
        toast.dismiss();
        toast.success("File download has started", {
            position: "top-center"
        },{
          autoClose: 2000
        })
        e.preventDefault();
        saveAs(message.url, message?.name);
    }

    return (
        <>
            {
                ((dateHelper(date) !== lastDate[index - 1]) || index === 0) && (
                <div className='flex justify-center text-c3 text-sm mb-5'>
                    <div className='bg-c1/[0.5] py-[6px] rounded-xl w-[145px] font-semibold text-center'>
                        {dateHelper(date)}
                    </div>
                </div>)
            }
            <div className={`mb-5 max-w-[75%] ${self ? "self-end" : ""} select-none`}>
                <ToastMessage />
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
                    <div className={`${message?.url ? "px-2 pt-2 pb-[4px]" : "px-[8px] pt-[8px] pb-[4px]"}
                        group flex flex-col rounded-md break-all bg-c5 ${self ? "rounded-br-sm" : 
                        "rounded-bl-sm"} relative`}>
                        {message?.url && (
                            <div 
                                className='mb-[2px]'
                                onDragStart={handleDragStart}
                            >
                                {
                                    message.type === "image"?
                                    (
                                        <div className='relative'>
                                            <Image 
                                                src={message?.url}
                                                width={220}
                                                height={220}
                                                alt={message?.text || ""}
                                                // loading='lazy'
                                                className='rounded-sm w-[220px] max-h-[220px] cursor-pointer
                                                    transition-opacity opacity-0 duration-[2s]'
                                                onLoadingComplete={(image) => image.classList.remove("opacity-0")}
                                                onClick={() => {
                                                    setImageViewer({
                                                        msgId: message?.id,
                                                        url: message?.url
                                                    })
                                                }}
                                            />
                                            <div className="hidden w-6 h-6 flex justify-center items-center rounded-full bg-white/[0.6] absolute bottom-2 right-2 group-hover:flex
                                                cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip content="Download" position="left">
                                                    <FaDownload size={15} color='black' />
                                                </Tooltip>
                                            </div>
                                            {
                                                imageViewer && imageViewer.msgId === message.id && (
                                                    <ImageViewer
                                                        src={[imageViewer?.url]}
                                                        currentIndex={0}
                                                        disableScroll={false}
                                                        closeOnClickOutside={true}
                                                        onClose={() => setImageViewer(null)}
                                                    />
                                                )
                                            }
                                        </div>
                                    ):
                                    message?.type === "audio" ?
                                    (
                                        <div className='flex w-[220px] h-[40px]'>
                                            <Image 
                                                src={"/music.png"}
                                                width={35}
                                                height={35}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[35px] h-[35px] relative top-[3px]'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col mt-1 ml-1'>
                                                <div className='flex items-center gap-2'>
                                                    <p className='line-clamp-1 text-white text-xs break-all'>
                                                        {message.name}
                                                    </p>
                                                    <div className="rounded-full cursor-pointer mr-2"
                                                        onClick={(e) => {
                                                            downloadMedia(e, message);
                                                        }}    
                                                    >
                                                        <Tooltip position="left" content="Download">
                                                            <FaDownload size={14} />
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <AudioPlayer messageExt={message.ext} messageUrl={message.url} />
                                            </div>
                                        </div>
                                    )
                                    :
                                    message?.type === "video" ?
                                    (
                                        <video controls className='w-[220px] max-h-[220px]'>
                                            <source src={message?.url} type={"video/" + message.ext} />
                                        </video>
                                    )
                                    :
                                    null
                                }
                            </div>
                        )}
                        {message?.url && message.type !== "image"  && message.type !== "audio"  && message.type !== "video" && (
                            <div 
                                className="mb-[4px] flex items-center justify-center"
                                onDragStart={handleDragStart}
                            >
                                {
                                    message?.ext === "pdf"?
                                    (
                                        <div className='flex max-w-[220px] min-w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/pdf.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px] relative -left-1'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full h-[80px]'>
                                                <p className='text-white cursor-pointer hover:text-c4 max-w-[87%]'
                                                    onClick={() => {
                                                        openInNewTab(message.url);
                                                    }}
                                                >
                                                    <Tooltip position="bottom" content="Open">
                                                        <span className='line-clamp-1 break-all'>
                                                            {message.name}
                                                        </span>
                                                    </Tooltip>
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    message?.ext === "docs" || message?.ext === "docx" || message?.ext === "doc" ?
                                    (
                                        <div className='flex gap-1 max-w-[220px] min-w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/doc.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px] relative -left-1'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full h-[80px]'>
                                                <p className='w-[87%] text-white cursor-pointer hover:text-c4'
                                                    onClick={() => {
                                                        const link = "https://docs.google.com/gview?url=" + message.url + ".doc&embedded=true";
                                                        openInNewTab(link)
                                                    }}
                                                >
                                                    <Tooltip position="bottom" content="Open">
                                                        <span className='line-clamp-1 break-all'>
                                                            {message.name}
                                                        </span>
                                                    </Tooltip>
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    message?.ext === "ppt" || message?.ext === "pptx"?
                                    (
                                        <div className='flex w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/ppt.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px] relative -left-1'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full h-[80px]'>
                                                <p className='w-[87%] text-white cursor-pointer hover:text-c4'
                                                    onClick={() => {
                                                        const link = "https://docs.google.com/gview?url=" + message.url + ".slides&embedded=true";
                                                        openInNewTab(link)
                                                    }}
                                                >
                                                    <Tooltip position="bottom" content="Open">
                                                        <span className='line-clamp-1 break-all'>
                                                            {message.name}
                                                        </span>
                                                    </Tooltip>
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    message?.ext === "xls" || message?.ext === "xlsx"?
                                    (
                                        <div className='flex w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/sheets.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px] relative -left-1'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full h-[80px]'>
                                                <p className='w-[87%] text-white cursor-pointer hover:text-c4'
                                                    onClick={() => {
                                                        const link = "https://docs.google.com/gview?url=" + message.url + ".sheets&embedded=true";
                                                        openInNewTab(link)
                                                    }}
                                                >
                                                    <Tooltip position="bottom" content="Open">
                                                        <span className='line-clamp-1 break-all'>
                                                            {message.name}
                                                        </span>
                                                    </Tooltip>
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    message?.ext === "txt" || message?.ext === "html"?
                                    (
                                        <div className='flex gap-2 w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/txt.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px]'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full h-[80px]'>
                                                <p className='w-[87%] text-white cursor-pointer hover:text-c4'
                                                    onClick={() => {
                                                        const link = "https://docs.google.com/gview?url=" + message.url + ".doc&embedded=true";
                                                        openInNewTab(message.url)
                                                    }}                                                                                                   
                                                >
                                                    <Tooltip position="bottom" content="Open">
                                                        <span className='line-clamp-1 break-all'>
                                                            {message.name}
                                                        </span>
                                                    </Tooltip>
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    message.ext === '7z' || message.ext === 'rar' || message.ext === 'zip' || message.ext === 'zipx' || message.ext === 'z' || message.ext === 'tar' || message.ext === 'taz' || message.ext === 'tz' || message.ext === 'iso' || message.ext === 'img' || message.ext === 'bz2'?
                                    (
                                        <div className='flex gap-2 w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/zip.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px]'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full'>
                                                <p className='line-clamp-1 text-white break-all max-w-[87%]'>
                                                    {message.name}
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                    :
                                    (
                                        <div className='flex gap-2 w-[220px] h-[40px] relative'>
                                            <Image 
                                                src={"/application.png"}
                                                width={100}
                                                height={100}
                                                alt={message?.text || ""}
                                                className='rounded-sm w-[45px]'
                                            />
                                            <div className='text-sm text-c3 leading-1 flex flex-col gap-1 w-full'>
                                                <p className='line-clamp-1 text-white break-all max-w-[87%]'>
                                                    {message.name}
                                                </p>
                                                <p className='text-xs'>
                                                    {message.size}
                                                </p>
                                            </div>
                                            <div className="rounded-full absolute top-1 right-1 cursor-pointer"
                                                onClick={(e) => {
                                                    downloadMedia(e, message);
                                                }}    
                                            >
                                                <Tooltip position="left" content="Download">
                                                    <FaDownload size={14} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )}
                        {message.text && (
                            <div className={`text-md select-text ${ message.type === "audio" ? "mt-3" : null } ${ message.img ? "max-w-[220px]" : null }`}>
                                {message.text}
                            </div>
                        )}
                        <div className={`flex items-center gap-1 mt-[1px] ${ self ? "justify-end" : "justify-end" }
                            ${message.text.length === 0 && message.type !== "image" && message.type !== "video" && message.type !== "audio" ? "absolute bottom-[6px] right-2" : null}
                        `}>
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
                                            setAttachmentPreview({
                                                blob: message.url,
                                                type: message.type,
                                                ext: message.ext,
                                            });
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
