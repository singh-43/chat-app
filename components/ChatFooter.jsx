import React, { useState } from 'react';
import Icons from './Icons';
import { CgAttachment } from "react-icons/cg";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import Composebar from './Composebar';
import ClickAwayListener from 'react-click-away-listener';
import { useChatContext } from '@/context/chatContext';
import { IoClose } from 'react-icons/io5';
import { MdDeleteForever } from 'react-icons/md';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const ChatFooter = () => {
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { editMsg, setEditMsg, inputText, setInputText, 
            setAttachment, setAttachmentPreview, attachmentPreview } = useChatContext();

    const onEmojiClick = (emojiData) => {
        let text = inputText;
        setInputText((text += emojiData?.native));
    };

    const onFileChange = (e) => {

        const file = e.target.files[0];

        setAttachment(file);
        e.target.value="";

        if(file) {
            const blobUrl = URL.createObjectURL(file);
            setAttachmentPreview(blobUrl);
        }

        /* eslint-disable @next/next/no-img-element */
    }

    // var file, file_ext, file_path, file_type, file_name;

    // const onFileChange = (e) => {
    //     const file = e.target.files[0];
    
    //     file_ext; //# will extract file extension
    //     file_type = file.type;
    //     file_name = file.name;
    //     file_path = (window.URL || window.webkitURL).createObjectURL(file);
    
    //     //# get file extension (eg: "jpg" or "jpeg" or "webp" etc)
    //     file_ext = file_name.toLowerCase();
    //     file_ext = file_ext.substr(
    //       file_ext.lastIndexOf('.') + 1,
    //       file_ext.length - file_ext.lastIndexOf('.')
    //     );
    
    //     //# get file type (eg: "image" or "video")
    //     file_type = file_type.toLowerCase();
    //     file_type = file_type.substr(0, file_type.indexOf('/'));
    
    //     setAttachment(file);
    //     e.target.value = '';
    
    //     if (file) {
    //       const blobUrl = URL.createObjectURL(file);
    //       setAttachmentPreview({
    //         blob: blobUrl,
    //         type: file_type,
    //       });
    //     }
    // };

    return (
        <div className='flex items-center bg-c1/[0.5] p-2 rounded-xl relative'>
            {attachmentPreview && (
                <div className='absolute w-[100px] h-[100px] bottom-16 left-0 bg-c1 p-2 rounded-md'>
                    <img src={attachmentPreview} alt='Attachment Preview' />
                    {/* {attachmentPreview.type === 'image' ? (
                        <img src={attachmentPreview.blob} alt="Attachment Preview" />
                    ) : (
                        <video width="100" height="100">
                            <source src={attachmentPreview.blob} type="video/mp4" />
                        </video>
                    )} */}
                    <div className='absolute -right-2 -top-2 cursor-pointer w-6 h-6 rounded-full bg-red-500 flex justify-center items-center'
                        onClick={() => {
                            setAttachment(null);
                            setAttachmentPreview(null);
                        }}
                    >
                        <MdDeleteForever size={14} />
                    </div>
                </div>
            )}
            <div className='shrink-0'>
                <input 
                    type='file'
                    id='fileUploader'
                    className='hidden'
                    onChange={onFileChange}
                    accept="image/*"
                    // accept="image/*, video/*, /*document"
                />
                <label htmlFor='fileUploader'>
                    <Icons
                        size="large"
                        icon={<CgAttachment size={20} />}
                        className="text-c3 transform: rotate-45"
                    />
                </label>
            </div>
            <div className='shrink-0 relative'>
                <Icons 
                    size="large"
                    icon={<HiOutlineEmojiHappy size={24} className="text-c3" />}
                    className={``}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                {
                    showEmojiPicker && (
                        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
                            <div className='absolute bottom-12 left-0 shadow-lg'>
                            <Picker data={data} onEmojiSelect={onEmojiClick} />
                            </div>
                        </ClickAwayListener>
                    )
                }
            </div>
            {
                editMsg &&
                <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-c4 flex items-center
                gap-2 py-2 px-4 pr-2 rounded-full text-sm font-semibold cursor-pointer'
                onClick={() => {
                    setEditMsg(null);
                    setAttachment(null);
                    setAttachmentPreview(null);
                }}
                >
                    <span>Cancel Edit</span>
                    <IoClose size={20} className='text-white' />
                </div>
            }
            <Composebar attachmentPreview={attachmentPreview} />
        </div>
    )
}

export default ChatFooter;