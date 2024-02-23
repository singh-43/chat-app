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
import { fileSize } from '@/utils/helpers';

const ChatFooter = () => {
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { editMsg, setEditMsg, inputText, setInputText, 
            setAttachment, setAttachmentPreview, attachmentPreview,
            setFileType, setFileExt, fileName, setFileName, setFileSize } = useChatContext();

    const onEmojiClick = (emojiData) => {
        let text = inputText;
        setInputText((text += emojiData?.native));
    };

    var file_ext, file_path, file_type, file_name;

    const onFileChange = (e) => {
        const file = e.target.files[0];
    
        setFileSize(fileSize(file.size));
        file_ext; //# will extract file extension
        file_type = file.type;
        file_name = file.name;
        setFileName(file_name);
        file_path = (window.URL || window.webkitURL).createObjectURL(file);
    
        //# get file extension (eg: "jpg" or "jpeg" or "webp" etc)
        file_ext = file_name.toLowerCase();
        file_ext = file_ext.substr(
          file_ext.lastIndexOf('.') + 1,
          file_ext.length - file_ext.lastIndexOf('.')
        );
        setFileExt(file_ext);
    
        //# get file type (eg: "image" or "video")
        file_type = file_type.toLowerCase();
        file_type = file_type.substr(0, file_type.indexOf('/'));
    
        setAttachment(file);
        setFileType(file_type);
        e.target.value = '';
    
        if (file) {
          const blobUrl = URL.createObjectURL(file);
          setAttachmentPreview({
            blob: blobUrl,
            type: file_type,
            ext: file_ext,
          });
        }
        /* eslint-disable @next/next/no-img-element */
    };

    return (
        <div className='flex items-center bg-c1/[0.5] p-2 rounded-xl relative'>
            {attachmentPreview && (
                <div className='flex absolute bottom-16 left-0 gap-2 items-end '>
                    <div className='min-w-[100px] min-h-[100px] max-w-[100px] max-h-[100px] bg-c1 p-2 rounded-md flex items-center justify-center'>
                        {
                            attachmentPreview.type === 'image' ? (
                                <img src={attachmentPreview.blob} alt="Attachment Preview" />
                            ) 
                            :
                            attachmentPreview.type === 'video' ? (
                                <video width="100" height="100">
                                    <source src={attachmentPreview.blob} type="video/mp4" />
                                </video>
                            )
                            :
                            attachmentPreview.ext === 'pdf' ? (
                                <img src={"/pdf.png"} alt="Attachment Preview" />
                            ) 
                            :
                            attachmentPreview.ext === 'docs' || attachmentPreview.ext === 'docx' || attachmentPreview.ext === 'doc' ? (
                                <img src={"/doc.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === 'ppt' || attachmentPreview.ext === 'pptx'? (
                                <img src={"/ppt.PNG"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === 'xls' || attachmentPreview.ext === 'xlsx'? (
                                <img src={"/sheets.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === 'txt'? (
                                <img src={"/txt.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === 'zip'? (
                                <img src={"/zip.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === 'exe'? (
                                <img src={"/exe.png"} alt="Attachment Preview" />
                            )
                            :
                            <img src={"/exe.png"} alt="Attachment Preview" />
                        }
                        <div className='absolute -top-2 left-[86px] cursor-pointer w-6 h-6 rounded-full bg-red-500 flex justify-center items-center'
                            onClick={() => {
                                setFileExt("");
                                setFileSize("");
                                setFileName("");
                                setFileType(null);
                                setAttachment(null);
                                setAttachmentPreview(null);
                            }}
                        >
                            <MdDeleteForever size={14} />
                        </div>
                    </div>
                    <div className='text-sm text-c3'>
                        <p className='line-clamp-1 break-all'>
                            {fileName}
                        </p>
                    </div>
                </div>
            )}
            <div className='shrink-0'>
                <input 
                    type='file'
                    id='fileUploader'
                    className='hidden'
                    onChange={onFileChange}
                    accept="*"
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
                    setFileExt("");
                    setFileSize("");
                    setFileName("");
                    setEditMsg(null);
                    setFileType(null);
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