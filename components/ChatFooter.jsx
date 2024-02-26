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
import { checkSize, findSize } from '@/utils/helpers';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';

const ChatFooter = () => {
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { editMsg, setEditMsg, inputText, setInputText, 
            setAttachment, setAttachmentPreview, attachmentPreview,
            setFileType, fileExt, setFileExt, fileName, setFileName, setFileSize, } = useChatContext();

    const onEmojiClick = (emojiData) => {
        let text = inputText;
        setInputText((text += emojiData?.native));
    };

    
    const onFileChange = (e) => {
        const file = e.target.files[0];
        var file_ext, file_path, file_type;
        file_ext; //# will extract file extension
        file_type = file.type;
        
        file_path = (window.URL || window.webkitURL).createObjectURL(file);
    
        //# get file extension (eg: "jpg" or "jpeg" or "webp" etc)
        file_ext = file.name.toLowerCase();
        file_ext = file_ext.substr(
          file_ext.lastIndexOf('.') + 1,
          file_ext.length - file_ext.lastIndexOf('.')
        );
        
        //# get file type (eg: "image" or "video")
        file_type = file_type.toLowerCase();
        file_type = file_type.substr(0, file_type.indexOf('/'));

        if(checkSize(file.size, file_type)){
            let errorMsg = "";
            if(file_type === "video"){
                errorMsg = "Can't send video message over 100 MB"
            }
            if(file_type !== "image" && file_type !== "audio" && file_type !== "video"){
                errorMsg = "Can't send document message over 2 GB"
            }
            toast.error(errorMsg, {
                position: "top-center"
            },{
              autoClose: 2000
            })
            e.target.value = '';
            return;
        }

        if(file_type !== "image" && file_type !== "audio" && file_type !== "video" && file_ext !== "html" && file_ext !== "pdf" && file_ext !== "doc" && file_ext !== "docs" && file_ext !== "docx" && file_ext !== "ppt" && file_ext !== "pptx" && file_ext !== "xls" && file_ext !== "xlsx" && file_ext !== "txt" && file_ext !== "7z" && file_ext !== "rar" && file_ext !== "zip" && file_ext !== "zipx" && file_ext !== "z" && file_ext !== "tar" && file_ext !== "taz" && file_ext !== "tz" && file_ext !== "iso" && file_ext !== "img" && file_ext !== "bz2"){
            toast.error("This file type is not supported. Please compress the file and then try again." , {
                position: "top-center"
            },{
                autoClose: 2000
            })
            e.target.value = '';
            return;
        }

        setAttachment(file);
        if(file_ext === "m4a"){
            setFileExt("x-m4a");
        }else{
            setFileExt(file_ext);
        }
        setFileType(file_type);
        setFileName(file.name);
        setFileSize(findSize(file.size));
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
            <ToastMessage />
            {attachmentPreview && (
                <div className='flex absolute bottom-16 left-0 gap-2 items-end'>
                    <div className='z-100 w-[100px] max-h-[100px] bg-c1 p-2 rounded-md flex items-center justify-center'>
                        {
                            attachmentPreview.type === 'image' ? (
                                <img src={attachmentPreview.blob} alt="Attachment Preview" className='max-h-[90px] max-w-[90px] rounded-sm' />
                            ) 
                            :
                            attachmentPreview.type === 'audio' ? (
                                <img src={"/music.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.type === 'video' ? (
                                <video className='max-h-[90px] max-w-[90px]'>
                                    <source src={attachmentPreview.blob} type={"video/" + fileExt} />
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
                            attachmentPreview.ext === 'txt' || attachmentPreview.ext === 'html'? (
                                <img src={"/txt.png"} alt="Attachment Preview" />
                            )
                            :
                            attachmentPreview.ext === '7z' || attachmentPreview.ext === 'rar' || attachmentPreview.ext === 'zip' || attachmentPreview.ext === 'zipx' || attachmentPreview.ext === 'z' || attachmentPreview.ext === 'tar' || attachmentPreview.ext === 'taz' || attachmentPreview.ext === 'tz' || attachmentPreview.ext === 'iso' || attachmentPreview.ext === 'img' || attachmentPreview.ext === 'bz2'? (
                                <img src={"/zip.png"} alt="Attachment Preview" />
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