import React, { useEffect, useState } from 'react';
import { TbSend } from "react-icons/tb";
import { useChatContext } from '@/context/chatContext';
import { Timestamp, arrayRemove, arrayUnion, deleteField, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { v4 as uuid } from 'uuid';
import { useAuth } from '@/context/authContext';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import BlockMsgPopUp from './popup/BlockMessagePopUp';
import { DELETED_FOR_ME } from '@/utils/constants';

let typingTimeout = null;

const Composebar = () => {

    const { currentUser } = useAuth();
    const [sChats, setSChats] = useState([]);
    const [showBlockPopup, setShowBlockPopup] = useState(false);
    const { inputText, users, selectedChat, setInputText, data, attachment, setAttachment,
            attachmentPreview, setAttachmentPreview, editMsg, setEditMsg , chats,
            fileType, fileName, fileExt, setFileType, setFileName, setFileExt
            , setFileSize, fileSize, loading, setLoading } = useChatContext();

    const IamBlocked = users[data?.user?.uid]?.blockedUsers?.find(u => u === currentUser?.uid);
    const isUserBlocked = users[currentUser?.uid]?.blockedUsers?.find(u => u === data?.user?.uid);

    useEffect(() => {
        setInputText(editMsg?.text || "");
        //eslint-disable-next-line
    }, [editMsg])   

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", selectedChat?.uid), (doc) => {
                if(doc.exists()){
                    const data = doc.data();
                    setSChats(data);
                }
            })
        }
        selectedChat.uid && getChats();
        //eslint-disable-next-line
    }, [selectedChat])

    const handleBlock = async (action) => {
        if(action === "unblock"){
            await updateDoc(doc(db, "users", currentUser.uid), {
                blockedUsers: arrayRemove(data.user.uid),
            })
        }
    }

    const handleTyping = async (e) => {
        setInputText(e.target.value);
        await updateDoc(doc(db, "chats", data.chatId), {
            [`typing.${currentUser.uid}`]: true,
        });

        if(typingTimeout){
            clearTimeout(typingTimeout);
        }

        typingTimeout = setTimeout(async () => {
            await updateDoc(doc(db, "chats", data.chatId), {
                [`typing.${currentUser.uid}`]: false,
            });
            typingTimeout = null;
        }, 500);
    }

    const onkeyup = (e) => {
        if(e.key === "Enter" && ((inputText.trim().length > 0 || attachment) || attachmentPreview)){
            if(isUserBlocked){
                setShowBlockPopup(true);
            }else{
                editMsg ? handleEdit() : handleSend();
            }
        }
    }

    const handleEdit = async () => {

        const messageId = editMsg.id;
        const chatRef = doc(db, "chats", data.chatId);
        const chatDoc = await getDoc(chatRef);

        if(attachment){
            //file uploading logic
            const storage = getStorage();
            const storageRef = ref(storage, uuid());

            const uploadTask = uploadBytesResumable(storageRef, attachment);

            uploadTask.on('state_changed', 
            (snapshot) => {
                
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                console.error(error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    let updatedMessages = chatDoc.data().messages.map((message) => {
                        if(message.id === messageId){
                            message.text = inputText
                            message.url = downloadURL
                            message.ext = fileExt
                            message.type = fileType
                            message.name = fileName
                            message.edited = true                      
                            // if(message.deletedInfo){
                            //     message.deletedInfo = null
                            // }
                        }
                        return message;
                    })
                    await updateDoc(chatRef, {
                        messages: updatedMessages
                    })
                });
            }
            );
        }else{
            let updatedMessages = chatDoc.data().messages.map((message) => {
                if(message.id === messageId){
                    if(message.text !== inputText){
                        message.text = inputText;
                        message.edited = true
                        // if(message.deletedInfo){
                        //     message.deletedInfo = null
                        // }
                    }
                    
                    if(!attachmentPreview && editMsg?.img){
                        message.img = null;
                        message.edited = true;
                        // if(message.deletedInfo){
                        //     message.deletedInfo = null
                        // }
                    }
                }
                return message;
            })
            await updateDoc(chatRef, {
                messages: updatedMessages
            })
        }

        let msg = { 
            text: inputText,
            sender: currentUser.uid,
            id: messageId,
        }
        if(attachment || attachmentPreview){
            msg.extName = fileExt;
            msg.type = fileType;
            msg.name = fileName;
            msg.size = fileSize;
        }

        const combinedId = currentUser.uid > selectedChat.uid ? 
                                currentUser.uid + selectedChat.uid
                                :
                                selectedChat.uid + currentUser.uid;
                                
        if(IamBlocked) {
            if(messageId === chats[combinedId].lastMessage.id){
                if(attachment) {
                    setTimeout(async () => {
                        await updateDoc(doc(db, "userChats", currentUser.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".chatDeleted"]: deleteField(),
                        });
                    }, 3500)
                } else {
                    await updateDoc(doc(db, "userChats", currentUser.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".chatDeleted"]: deleteField(),
                    });
                }
            }
        } else {
            if(messageId === chats[combinedId].lastMessage.id){
                if(attachment) {
                    setTimeout(async () => {
                        await updateDoc(doc(db, "userChats", currentUser.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".chatDeleted"]: deleteField(),
                        });
                    }, 3500)
                } else {
                    await updateDoc(doc(db, "userChats", currentUser.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".chatDeleted"]: deleteField(),
                    });
                }
            }
            if(messageId === sChats[combinedId].lastMessage.id){
                if(attachment) {
                    setTimeout(async () => {
                        await updateDoc(doc(db, "userChats", selectedChat.uid),{
                            [data.chatId + ".lastMessage"]: msg,
                            [data.chatId + ".chatDeleted"]: deleteField(),
                        });
                    }, 3500)
                } else {
                    await updateDoc(doc(db, "userChats", selectedChat.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".chatDeleted"]: deleteField(),
                    });
                }
            }
        }

        setFileExt("");
        setFileSize("");
        setFileName("");
        setEditMsg(null);
        setInputText("");
        setFileType(null);
        setAttachment(null);
        setAttachmentPreview(null);
    }

    const handleSend = async () => {
        const combinedId = currentUser.uid > selectedChat.uid ? 
                                currentUser.uid + selectedChat.uid
                                :
                                selectedChat.uid + currentUser.uid;
        await updateDoc(doc(db, "userChats", selectedChat.uid), {
            [combinedId + ".chatDeleted"]: deleteField()
        })
        const selectedUserIsChattingWithMe = users[currentUser.uid]?.selectedChat?.find(u => u === selectedChat?.uid);

        const messageUniqueId = uuid();

        const inputText1 = inputText;
        const attachment1 = attachment;
        const attachmentPreview1 = attachmentPreview;

        setInputText("");
        setAttachment(null);
        setAttachmentPreview(null);
        
        if(attachment1) {
            //file uploading logic
            const storage = getStorage();
            const storageRef = ref(storage,"( " + messageUniqueId + " )___" + fileName);

            const uploadTask = uploadBytesResumable(storageRef, attachment1);

            uploadTask.on('state_changed', 
            (snapshot) => {
                
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                console.error(error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    if(IamBlocked) {
                        await updateDoc(doc(db, "chats", data.chatId), {
                            messages: arrayUnion({
                                id: messageUniqueId,
                                text: inputText1,
                                sender: currentUser.uid,
                                date: Timestamp.now(),
                                read: false,
                                url: downloadURL,
                                ext: fileExt,
                                type: fileType,
                                name: fileName,
                                size: fileSize,
                                deletedInfo : {
                                    [data?.user?.uid]: DELETED_FOR_ME
                                }
                            })
                        })
                    } else {
                        if(selectedUserIsChattingWithMe){
                            await updateDoc(doc(db, "chats", data.chatId), {
                                messages: arrayUnion({
                                    id: messageUniqueId,
                                    text: inputText1,
                                    sender: currentUser.uid,
                                    date: Timestamp.now(),
                                    read: true,
                                    url: downloadURL,
                                    ext: fileExt,
                                    type: fileType,
                                    name: fileName,
                                    size: fileSize,
                                })
                            })
                        }else{
                            await updateDoc(doc(db, "chats", data.chatId), {
                                messages: arrayUnion({
                                    id: messageUniqueId,
                                    text: inputText1,
                                    sender: currentUser.uid,
                                    date: Timestamp.now(),
                                    read: false,
                                    url: downloadURL,
                                    ext: fileExt,
                                    type: fileType,
                                    name: fileName,
                                    size: fileSize,
                                })
                            })
                        }
                    }
                });
            }
            );
        } else {
            if(IamBlocked) {
                await updateDoc(doc(db, "chats", data.chatId), {
                    messages: arrayUnion({
                        id: messageUniqueId,
                        text: inputText1,
                        sender: currentUser?.uid,
                        date: Timestamp.now(),
                        read: false,
                        deletedInfo : {
                            [data?.user?.uid]: DELETED_FOR_ME
                        }
                    })
                })
            } else {
                if(selectedUserIsChattingWithMe) {
                    await updateDoc(doc(db, "chats", data.chatId), {
                        messages: arrayUnion({
                            id: messageUniqueId,
                            text: inputText1,
                            sender: currentUser?.uid,
                            date: Timestamp.now(),
                            read: true,
                        })
                    })
                } else{
                    await updateDoc(doc(db, "chats", data.chatId), {
                        messages: arrayUnion({
                            id: messageUniqueId,
                            text: inputText1,
                            sender: currentUser?.uid,
                            date: Timestamp.now(),
                            read: false,
                        })
                    })
                }
            }
        }

        let msg = { 
            text: inputText1,
            sender: currentUser.uid,
            id: messageUniqueId,
        }
        if(attachment1){
            msg.extName = fileExt;
            msg.type = fileType;
            msg.name = fileName;
            msg.size = fileSize;
        }

        if(IamBlocked) {
            if(attachment1) {
                setTimeout(async () => {
                    await updateDoc(doc(db, "userChats", currentUser.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".date"]: serverTimestamp(),
                        [data.chatId + ".chatDeleted"]: deleteField(),
                    });
                }, 3500)
            } else {
                await updateDoc(doc(db, "userChats", currentUser.uid),{
                    [data.chatId + ".lastMessage"]: msg,
                    [data.chatId + ".date"]: serverTimestamp(),
                    [data.chatId + ".chatDeleted"]: deleteField(),
                });
            }
        } else {
            if(attachment1) {
                setTimeout(async () => {
                    await updateDoc(doc(db, "userChats", currentUser.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".date"]: serverTimestamp(),
                        [data.chatId + ".chatDeleted"]: deleteField(),
                    });
                    await updateDoc(doc(db, "userChats", data.user.uid),{
                        [data.chatId + ".lastMessage"]: msg,
                        [data.chatId + ".date"]: serverTimestamp(),
                    });
                }, 3500)
            } else {
                await updateDoc(doc(db, "userChats", currentUser.uid),{
                    [data.chatId + ".lastMessage"]: msg,
                    [data.chatId + ".date"]: serverTimestamp(),
                    [data.chatId + ".chatDeleted"]: deleteField(),
                });
                await updateDoc(doc(db, "userChats", data.user.uid),{
                    [data.chatId + ".lastMessage"]: msg,
                    [data.chatId + ".date"]: serverTimestamp(),
                });
            }
        }
        setFileExt("");
        setFileSize("");
        setFileName("");
        setFileType(null);
    }

    return (
        <div className='flex items-center gap-2 grow'>
            {showBlockPopup && (<BlockMsgPopUp
                self={self}
                noHeader={true}
                shortHeight={true}
                className="BlockMsgPopUp"
                handleBlock={handleBlock}
                onHide={() => setShowBlockPopup(false)}
            />)}
            <input 
                type='text'
                value={inputText}
                spellCheck={false}
                onKeyUp={onkeyup}
                onChange={handleTyping}
                placeholder='Type a message'
                className='grow w-full outline-0 px-2 py-2 text-white bg-transparent placeholder:text-c3
                    outline-none text-base break-all'
            />
            <button className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center
                ${((inputText.trim().length > 0 || attachment) || attachmentPreview) ? "bg-c4" : ""}`}
                onClick={editMsg ? handleEdit : handleSend}
                disabled = {!inputText.trim().length > 0 && !attachment && !attachmentPreview}
            >
                <TbSend size={20} className="text-white" />
            </button>
        </div>
    )
}

export default Composebar;