import { IoClose } from 'react-icons/io5';
import Message from './Message';
import { db } from '@/firebase/firebase';
import { dateHelper } from '@/utils/helpers';
import { useChatContext } from '@/context/chatContext';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Timestamp, deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { DELETED_FOR_ME, DELETED_FOR_EVERYONE } from '@/utils/constants';
import { useAuth } from '@/context/authContext';

const Messages = () => {

    const ref = useRef();
    const unreadRef = useRef(null);
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [lastDate, setLastDate] = useState({})
    const [src, setSrc] = useState("")
    const { data, setIsTyping, selectedChat, unread, setUnread, } = useChatContext();

    const updateLastMessage = async (messageId, action) => {
        try {
            let i;
            let currentUserMessageUpdated = false, selectedUserMessageUpdated = false;
            for(i = messages?.length - 1; i >= 0; i--){
                if(action !== DELETED_FOR_EVERYONE){
                    if(messageId !== messages[i].id && messages[i]?.deletedInfo?.[currentUser.uid] !== DELETED_FOR_ME && !messages[i]?.deletedInfo?.deletedForEveryone && !messages[i]?.deleteChatInfo?.[currentUser.uid]){
                        let msg = { 
                            text: messages[i].text,
                            sender: messages[i].sender,
                            id: messages[i].id,
                        }
                        if(messages[i]?.url) {
                            msg.url = messages[i].url;
                            msg.extName = messages[i].ext;
                            msg.type = messages[i].type;
                            msg.name = messages[i].name;
                            msg.size = messages[i].size;
                        }
                        await updateDoc(doc(db, "userChats", currentUser.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".date"]: messages[i]?.date,
                        });
                        break;
                    }
                }else {
                    if(selectedUserMessageUpdated && currentUserMessageUpdated){
                        break;
                    }
                    if(!currentUserMessageUpdated && messageId !== messages[i].id && messages[i]?.deletedInfo?.[currentUser.uid] !== DELETED_FOR_ME && !messages[i]?.deletedInfo?.deletedForEveryone && !messages[i]?.deleteChatInfo?.[currentUser.uid]){
                        let msg = { 
                            text: messages[i].text,
                            sender: messages[i].sender,
                            id: messages[i].id,
                        }
                        if(messages[i]?.url) {
                            msg.url = messages[i].url;
                            msg.extName = messages[i].ext;
                            msg.type = messages[i].type;
                            msg.name = messages[i].name;
                            msg.size = messages[i].size;
                        }
                        await updateDoc(doc(db, "userChats", currentUser.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".date"]: messages[i]?.date,
                        });
                        currentUserMessageUpdated = true;
                    }
                    if(!selectedUserMessageUpdated && messageId !== messages[i].id && messages[i]?.deletedInfo?.[selectedChat.uid] !== DELETED_FOR_ME && !messages[i]?.deletedInfo?.deletedForEveryone && !messages[i]?.deleteChatInfo?.[selectedChat.uid]){
                        let msg = { 
                            text: messages[i].text,
                            sender: messages[i].sender,
                            id: messages[i].id,
                        }
                        if(messages[i]?.url) {
                            msg.url = messages[i].url;
                            msg.extName = messages[i].ext;
                            msg.type = messages[i].type;
                            msg.name = messages[i].name;
                            msg.size = messages[i].size;
                        }
                        await updateDoc(doc(db, "userChats", selectedChat.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".date"]: messages[i]?.date,
                        });
                        selectedUserMessageUpdated = true; 
                    }
                }                
            }
            if(i === -1){
                if(action === DELETED_FOR_EVERYONE){
                    if(!currentUserMessageUpdated){
                        await updateDoc(doc(db, "userChats", currentUser.uid),{
                            [data.chatId + ".lastMessage"]: deleteField(),
                            // [data.chatId + ".date"]: deleteField(),
                        });
                    }
                    if(!selectedUserMessageUpdated){
                        await updateDoc(doc(db, "userChats", selectedChat.uid),{
                            [data.chatId + ".lastMessage"]: deleteField(),
                            // [data.chatId + ".date"]: deleteField(),
                        });
                    }
                }else{
                    await updateDoc(doc(db, "userChats", currentUser.uid),{
                        [data.chatId + ".lastMessage"]: deleteField(),
                        // [data.chatId + ".date"]: deleteField(),
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if(doc.exists()) {
                setMessages(doc.data().messages);
                setIsTyping(doc.data()?.typing?.[data.user.uid] || false);
            }
            setTimeout(() => {
                scrollToBottom();
            }, 0);
            if(unread){
                setTimeout(() => {
                    unreadRef.current?.scrollIntoView();
                }, 0);
            }
        })
        return () => unsub();
        //eslint-disable-next-line
    }, [data.chatId]);

    const messagesData = messages?.filter((m) => {
        return m?.deletedInfo?.[currentUser.uid] !== DELETED_FOR_ME && !m?.deletedInfo?.deletedForEveryone && !m?.deleteChatInfo?.[currentUser.uid];
    })

    useEffect(() => {
        setTimeout(() => {
            setUnread(null)
        }, 1000)
        //eslint-disable-next-line
    }, [!unread])

    const scrollToBottom = () => {
        const chatContainer = ref?.current;
        chatContainer.scrollTop = chatContainer?.scrollHeight;
    }

    // useEffect(() => {
    //     const updatedDate = {}
    //     messagesData?.map((m, index) => {
    //         const timestamp = new Timestamp(
    //             m.date?.seconds,
    //             m.date?.nanoseconds
    //         );
        
    //         const date = timestamp.toDate();
    //         updatedDate[index] = dateHelper(date);
    //     })
    //     setLastDate(updatedDate)
    //     //eslint-disable-next-line
    // }, [messages]) 

    return (
        <div 
            ref={ref}
            className='grow p-5 overflow-auto scrollbar flex flex-col relative'
        >
            {messagesData?.map((m, i) => {
                return (
                    <React.Fragment  key={m.id}>
                        {
                            unread && i === messagesData?.length - unread  && currentUser?.uid !== m?.sender  && 
                            <div className='flex justify-center mb-5'>
                                <div ref={unreadRef} id="content" className='bg-c1/[0.5] py-[6px] text-sm rounded-xl w-[145px] text-center'>
                                {`${unread} Unread messages`}
                                </div>
                            </div>
                        }
                        <Message message={m} updateLastMessage={updateLastMessage} 
                            setSrc={setSrc}
                            // lastDate={lastDate} index={i}
                        />
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export default Messages;
