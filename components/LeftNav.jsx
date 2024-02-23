import React, { useState } from 'react';
import Avatar from './Avatar';
import Icons from './Icons';
import { BiEdit, BiCheck } from "react-icons/bi";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useAuth } from '@/context/authContext';
import { FiPlus } from "react-icons/fi";
import { IoLogOutOutline, IoClose } from "react-icons/io5";
import {MdAddAPhoto, MdDeleteForever, MdPhotoCamera } from "react-icons/md";
import { profileColors } from '@/utils/constants';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import UsersPopup from './popup/UsersPopup';

const LeftNav = () => {

    const authUser = auth.currentUser;
    const [editProfile, setEditProfile] = useState(false);
    const [nameEdited, setNameEdited] = useState(false);
    const [usersPopup, setUsersPopup] = useState(false);
    const { currentUser, signOut, setCurrentUser } = useAuth();
    
    const uploadImageToFirestore = (file) => {
        try {
            if(file){
                //file uploading logic
                const storage = getStorage();
                const storageRef = ref(storage, currentUser.displayName);

                const uploadTask = uploadBytesResumable(storageRef, file);

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
                        console.log('File available at', downloadURL);
                        handleUpdateProfile("photo", downloadURL);
                    });
                }
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateProfile = (type, value) => {
        // color, name, photo, photo-remove
        let obj = {...currentUser};
        switch(type) {
            case "color" :
                obj.color = value;
                break;
            case "name" :
                obj.displayName = value;
                obj.name = value.toLowerCase();
                break;
            case "photo" :
                obj.photoURL = value;
                break;
            case "photo-remove" :
                obj.photoURL = null;
                break;
            default:
                break;
        }

        try {
            toast.promise(async () => {

                const userDocRef = doc(db, "users", currentUser.uid);
                await updateDoc(userDocRef, obj); 
                setCurrentUser(obj);
                
                if(type === "photo-remove"){
                    await updateProfile(authUser, {
                        photoURL: null
                    })
                }

                if(type === "photo"){
                    await updateProfile(authUser, {
                        photoURL: value,
                    })
                }

                if(type === "name"){
                    await updateProfile(authUser, {
                        displayName: value,
                        name: value.toLowerCase(),
                    })
                }
                
            }, {
                  pending: 'Updating profile',
                  success: 'Profile updated successfully',
                  error: 'Profile update failed'
            },{
              autoClose: 3000
            })
        } catch (error) {
            console.error(error);
        }
    }

    const onkeyup = (event) => {
        if(event.target.innerText.trim() !== currentUser.displayName){
            setNameEdited(true);
        }else {
            setNameEdited(false);
        }
    }
    const onkeydown = (event) => {
        if(event.key === "Enter" && event.keyCode === 13) {
            event.preventDefault();
        }
    }
    
    const editProfileContainer = () => {
        return (
            <div className='relative flex flex-col items-center select-none'>
                <ToastMessage />
                <Icons 
                    size="small"
                    className="absolute top-0 right-5
                        hover:bg-c2"
                    icon={<IoClose size={20} />}
                    onClick={() => setEditProfile(false)}
                />
                <div className='relative group cursor-pointer'>
                    <Avatar size="xx-large" user={currentUser} />
                    <div className='w-full h-full rounded-full bg-black/[0.5]
                        absolute top-0 left-0 justify-center items-center
                        hidden group-hover:flex'>
                        <label htmlFor='fileUpload'>
                            {
                                currentUser.photoURL ? (
                                    <MdPhotoCamera size={34} 
                                        className='cursor-pointer'
                                    />
                                ) : (
                                    <MdAddAPhoto size={34} 
                                        className='cursor-pointer'
                                    />
                                )
                            }
                        </label>
                        <input 
                            id='fileUpload'
                            type='file'
                            style={{display: "none"}}
                            onChange={(e) => { 
                                uploadImageToFirestore(e.target.files[0]);
                                e.target.value=""
                            }}
                        />
                    </div>
                    {currentUser?.photoURL && (
                        <div className='w-6 h-6 rounded-full bg-red-500 flex
                            justify-center items-center absolute right-0 bottom-0'
                            onClick={() => handleUpdateProfile("photo-remove")}
                        >
                            <MdDeleteForever size={14} />
                        </div>
                    )}
                </div>
                <div className='mt-5 flex flex-col items-center'>
                    <div className='flex items-center gap-2'>
                        <div contentEditable
                            id='displayNameEdit'
                            onKeyUp={onkeyup}
                            onKeyDown={onkeydown}
                            spellCheck={false}
                            suppressContentEditableWarning={true}
                            className='bg-transparent outline-none border-none text-center'
                            >{currentUser?.displayName}
                        </div>
                        {!nameEdited && <BiEdit 
                            className='text-c3'
                        />}
                        {nameEdited && <BsFillCheckCircleFill 
                            className='text-c4 cursor-pointer'
                            onClick={() => {
                                handleUpdateProfile("name", document
                                .getElementById("displayNameEdit").innerText);
                                setNameEdited(false);
                            }}
                        />}
                    </div>
                    <span className='text-c3 text-md'>{currentUser?.email}</span>
                </div>
                <div className='grid grid-cols-5 gap-4 mt-5'>
                    {profileColors.map((color, index) => (
                        <span
                            key={index}
                            className='w-10 h-10 rounded-full flex items-center
                                justify-center cursor-pointer transition-transform hover:scale-125'
                            style={{backgroundColor: color}}
                            onClick={() => {
                                handleUpdateProfile("color", color);
                            }}
                        >
                            {color === currentUser?.color && <BiCheck size={24} />}
                        </span>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`${editProfile ? "w-[350px]" : "w-[80px] items-center"} py-5 flex flex-col justify-between
            shrink-0 transition-all`}>
            {editProfile ? editProfileContainer() : (
                <div className='relative group cursor-pointer'
                    onClick={() => {setEditProfile(true)}}
                >
                    <Avatar user={currentUser} size="large" />
                    <div className='bg-black/[0.5] w-full h-full rounded-full 
                        justify-center items-center absolute left-0 top-0 hidden 
                        group-hover:flex'>
                        <BiEdit size={14} />
                    </div>
                </div>
            )}
            <div className={`${ editProfile ? "justify-center" : "flex-col " } flex
                gap-5 items-center`}>
                <Icons 
                    size="x-large"
                    icon={<FiPlus />}
                    className="bg-green-500
                        hover:bg-green-600"
                    onClick={() => setUsersPopup(!usersPopup)}
                />
                <Icons 
                    size="x-large"
                    icon={<IoLogOutOutline />}
                    className="hover:bg-c2"
                    onClick={signOut}
                />
            </div>
            {
                usersPopup && <UsersPopup onHide = {() => setUsersPopup(false)}
                    title="Find Chats"
                />
            }
        </div>
    )
}

export default LeftNav;