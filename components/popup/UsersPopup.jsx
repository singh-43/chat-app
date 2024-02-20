import React, { useState } from 'react';
import Avatar from '../Avatar';
import { RiSearch2Line } from "react-icons/ri";
import PopupWrapper from './PopupWrapper';
import { db } from '@/firebase/firebase';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const UsersPopup = (props) => {

    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const { users, dispatch, setSelectedChat } = useChatContext();

    const handleSelect = async (user) => {
        try {
            const combinedId = currentUser.uid > user.uid ? 
                                currentUser.uid + user.uid
                                :
                                user.uid + currentUser.uid;
            const res = await getDoc(doc(db, "chats", combinedId))

            if(!res.exists()){
                
                await setDoc(doc(db, "chats", combinedId), {
                    messages: []
                })

                const userChatRef = await getDoc(doc(db, "userChats", user.uid));
                const currentUserChatRef = await getDoc(doc(db, "userChats", currentUser.uid));
                
                if(!userChatRef.exists()) {
                    await setDoc(doc(db, "userChats", user.uid), {})
                }

                await updateDoc(doc(db, "userChats", user.uid),{
                    [combinedId + ".userInfo"]: {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL || null,
                        color: currentUser.color
                    },
                    [combinedId +".date"]: serverTimestamp(),
                })

                if(!currentUserChatRef.exists()) {
                    await setDoc(doc(db, "userChats", currentUser.uid), {})
                }

                await updateDoc(doc(db, "userChats", currentUser.uid),{
                    [combinedId + ".userInfo"]: {
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL || null,
                        color: user.color
                    },
                    [combinedId +".date"]: serverTimestamp(),
                })
                
            }else {
                //chat document exists
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [combinedId + ".chatDeleted"]: deleteField(),
                    [combinedId + ".date"]: serverTimestamp(),
                })
            }

            dispatch({type: 'CHANGE_USER', payload: user});
            props.onHide();

        } catch (error) {
            console.error(error);
        }
    } 

    const filteredUsers = Object.entries(users).sort((a, b) => {
        if(a[1].displayName < b[1].displayName) { return -1; }
        if(a[1].displayName > b[1].displayName) { return 1; }
        return 0;
    });
    
    const currentUserDetails = filteredUsers.filter((item) => ( item[0] === currentUser?.uid ));
    const otherUsersDetails = filteredUsers.filter((item) => ( item[0] !== currentUser?.uid ));
    otherUsersDetails.splice(0,0, currentUserDetails[0], currentUserDetails[1]);
    const allUsersDetails = otherUsersDetails.filter((item) => ( item !== undefined));
    const usersList = Object?.fromEntries(allUsersDetails);
    const finalList = Object.entries(usersList || {})
    .filter(([, userData]) => userData?.displayName.toLowerCase().includes(search.toLowerCase()))

    return (
        <PopupWrapper {...props}>
            <div className='relative'>
                <RiSearch2Line className="absolute top-4 text-c3 left-4" />
                <input 
                    type='text'
                    placeholder='Search User'
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    value={search}
                    autoFocus
                    spellCheck={false}
                    className='w-full h-12 rounded-xl bg-c1/[0.5] pl-11 pr-16
                        placeholder:text-c3 outline-none text-base'
                />
                {/* <span className='absolute top-[14px] right-4 text-sm text-c3 select-none'>Enter</span> */}
            </div>
            <div className='mt-5 flex flex-col gap-2 grow relative overflow-auto 
                scrollbar select-none'>
                <div className='absolute w-full'>
                    { 
                        finalList.length > 0 ?
                        Object.keys(users || {}).length > 0 && finalList?.map((userData) => {
                            const user = users[userData[1].uid]
                            return (
                                <div
                                    key={user.uid}
                                    onClick={() => {
                                        handleSelect(user)
                                        setSelectedChat(user);
                                    }}
                                    className='flex gap-4 py-2 px-4 hover:bg-c5 rounded-xl
                                        cursor-pointer items-center'
                                >
                                    <Avatar size="large" user={user} />
                                    <div className='flex flex-col gap-1 grow'>
                                        <span className='text-white text-base'>
                                            <div className='font-medium'>{`${user.displayName} ${ currentUser?.uid === user?.uid ? "(You)" : "" }`}</div>
                                        </span>
                                        <p className='text-sm text-c3'>{user.email}</p>
                                    </div>
                                </div>
                            )
                        })
                        :
                        <div className='absolute top-40 left-1/2 -translate-x-1/2 text-white break-all'>No results found for &#39;{search}&#39;</div>
                        // <div className='flex justify-center items-center text-white'>No results found for &#39;{search}&#39;</div>
                    }
                </div>
            </div>
        </PopupWrapper>
    )
    
}

export default UsersPopup;

// import { db } from '@/firebase/firebase';
// import React, { useState } from 'react';
// import { RiSearch2Line } from "react-icons/ri";
// import Avatar from './Avatar';
// import { useAuth } from '@/context/authContext';
// import { useChatContext } from '@/context/chatContext';
// import { collection, doc, getDoc, getDocs, query, setDoc, serverTimestamp, updateDoc, where } from 'firebase/firestore';

// const Search = (props) => {

//     const { currentUser } = useAuth();
//     const { dispatch, setSelectedChat } = useChatContext();
//     const [err, setErr] = useState(false);
//     const [users, setUsers] = useState({});
//     const [username, setUsername] = useState("");

//     const onkeyup = async (e) => {
//         if(e.key === "Enter" && !!username){
//             try {
//                 setErr(false);
//                 const usersRef = collection(db, "users");
//                 const q = query(usersRef, where("name", "==", username.toLowerCase()));

//                 const querySnapshot = await getDocs(q);
//                 if(querySnapshot.empty) {
//                     setErr(true);
//                     setUsers({});
//                 }else {
//                     const updatedUsers = {};
//                     querySnapshot.forEach((doc) => {
//                         updatedUsers[doc.id] = doc.data();
//                     })
//                     setUsers(updatedUsers);
//                 }

//             } catch (error) {
//                 console.error(error);
//                 setErr(error);
//             }
//         }
//     }

//     const handleSelect = async (user) => {
        
//         try {
//             const combinedId = currentUser.uid > user.uid ? 
//                                 currentUser.uid + user.uid
//                                 :
//                                 user.uid + currentUser.uid;
//             const res = await getDoc(doc(db, "chats", combinedId))

//             if(!res.exists()){
                
//                 await setDoc(doc(db, "chats", combinedId), {
//                     messages: []
//                 })

//                 const userChatRef = await getDoc(doc(db, "userChats", user.uid));
//                 const currentUserChatRef = await getDoc(doc(db, "userChats", currentUser.uid));
                
//                 if(!userChatRef.exists()) {
//                     await setDoc(doc(db, "userChats", user.uid), {})
//                 }

//                 await updateDoc(doc(db, "userChats", user.uid),{
//                     [combinedId + ".userInfo"]: {
//                         uid: currentUser.uid,
//                         displayName: currentUser.displayName,
//                         photoURL: currentUser.photoURL || null,
//                         color: currentUser.color
//                     },
//                     [combinedId +".date"]: serverTimestamp(),
//                 })

//                 if(!currentUserChatRef.exists()) {
//                     await setDoc(doc(db, "userChats", currentUser.uid), {})
//                 }

//                 await updateDoc(doc(db, "userChats", currentUser.uid),{
//                     [combinedId + ".userInfo"]: {
//                         uid: user.uid,
//                         displayName: user.displayName,
//                         photoURL: user.photoURL || null,
//                         color: user.color
//                     },
//                     [combinedId +".date"]: serverTimestamp(),
//                 })
                
//             }else {
//                 <>
//                 </>
//             }

//             props.onHide();
//             dispatch({type: 'CHANGE_USER', payload: user});

//         } catch (error) {
//             console.error(error);
//         }
//     } 

//     return (
//         <div className='shrink-0 select-none'>
//             <div className='relative'>
//                 <RiSearch2Line className="absolute top-4 text-c3 left-4" />
//                 <input 
//                     type='text'
//                     placeholder='Search User'
//                     onChange={(e) => {
//                         setUsername(e.target.value);
//                         if(e.target.value < username){
//                             setErr(false);
//                             setUsers({});
//                         }
//                     }}
//                     onKeyUp={onkeyup}
//                     value={username}
//                     autoFocus
//                     spellCheck={false}
//                     className='w-full h-12 rounded-xl bg-c1/[0.5] pl-11 pr-16
//                         placeholder:text-c3 outline-none text-base'
//                 />
//                 <span className='absolute top-[14px] right-4 text-sm text-c3 select-none'>Enter</span>
//             </div>

//             {err && username !== "" && (
//                 <>
//                     <div className='mt-5 w-full text-center text-sm'>
//                         User not found
//                     </div>
//                     <div className='w-full h-[1px] bg-white/[0.1] mt-5'></div>
//                 </>
//             )}

//             { users && username !== "" && Object.values(users).map((user, index) => (
//                 <React.Fragment key={user?.uid}>
//                     <>
//                         <div
//                             onClick={() => {
//                                 handleSelect(user);
//                                 setSelectedChat(user);
//                             }}
//                             className='flex gap-4 py-2 px-4 hover:bg-c5 rounded-xl
//                                 cursor-pointer items-center mt-2'
//                         >
//                             <Avatar size="large" user={user} />
//                             <div className='flex flex-col gap-1 grow'>
//                                 <span className='text-white text-base'>
//                                     <div className='font-medium'>{`${user.displayName} ${ currentUser?.uid === user?.uid ? "(You)" : "" }`}</div>
//                                 </span>
//                                 <p className='text-sm text-c3'>{user.email}</p>
//                             </div>
//                         </div>
//                         {Object.keys(users).length - 1 === index ? <div className='w-full h-[1px] bg-white/[0.1] mt-5'></div> : null }
//                     </>
//                 </React.Fragment>
//             ))
//             }
//         </div>
//     )
// }

// export default Search;

// import React from 'react';
// import Avatar from '../Avatar';
// import Search from '../Search';
// import PopupWrapper from './PopupWrapper';
// import { db } from '@/firebase/firebase';
// import { useAuth } from '@/context/authContext';
// import { useChatContext } from '@/context/chatContext';
// import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

// const UsersPopup = (props) => {

//     const { currentUser } = useAuth();
//     const { users, dispatch, setSelectedChat } = useChatContext();

//     const handleSelect = async (user) => {
//         try {
//             const combinedId = currentUser.uid > user.uid ? 
//                                 currentUser.uid + user.uid
//                                 :
//                                 user.uid + currentUser.uid;
//             const res = await getDoc(doc(db, "chats", combinedId))

//             if(!res.exists()){
                
//                 await setDoc(doc(db, "chats", combinedId), {
//                     messages: []
//                 })

//                 const userChatRef = await getDoc(doc(db, "userChats", user.uid));
//                 const currentUserChatRef = await getDoc(doc(db, "userChats", currentUser.uid));
                
//                 if(!userChatRef.exists()) {
//                     await setDoc(doc(db, "userChats", user.uid), {})
//                 }

//                 await updateDoc(doc(db, "userChats", user.uid),{
//                     [combinedId + ".userInfo"]: {
//                         uid: currentUser.uid,
//                         displayName: currentUser.displayName,
//                         photoURL: currentUser.photoURL || null,
//                         color: currentUser.color
//                     },
//                     [combinedId +".date"]: serverTimestamp(),
//                 })

//                 if(!currentUserChatRef.exists()) {
//                     await setDoc(doc(db, "userChats", currentUser.uid), {})
//                 }

//                 await updateDoc(doc(db, "userChats", currentUser.uid),{
//                     [combinedId + ".userInfo"]: {
//                         uid: user.uid,
//                         displayName: user.displayName,
//                         photoURL: user.photoURL || null,
//                         color: user.color
//                     },
//                     [combinedId +".date"]: serverTimestamp(),
//                 })
                
//             }else {
//                 <>
//                 </>
//             }

//             dispatch({type: 'CHANGE_USER', payload: user});
//             props.onHide();

//         } catch (error) {
//             console.error(error);
//         }
//     } 

//     const filteredUsers = Object.entries(users).sort((a, b) => {
//         if(a[1].displayName < b[1].displayName) { return -1; }
//         if(a[1].displayName > b[1].displayName) { return 1; }
//         return 0;
//     });
    
//     const currentUserDetails = filteredUsers.filter((item) => ( item[0] === currentUser?.uid ));
//     const otherUsersDetails = filteredUsers.filter((item) => ( item[0] !== currentUser?.uid ));
//     otherUsersDetails.splice(0,0, currentUserDetails[0], currentUserDetails[1]);
//     const allUsersDetails = otherUsersDetails.filter((item) => ( item !== undefined));
//     const usersList = Object?.fromEntries(allUsersDetails);

//     return (
//         <PopupWrapper {...props}>
//             <Search {...props} />
//             <div className='mt-5 flex flex-col gap-2 grow relative overflow-auto 
//                 scrollbar select-none'>
//                 <div className='absolute w-full'>
//                     { usersList && 
//                             Object.values(usersList)
//                             // Object.values(usersList).filter((item) => item?.uid !== currentUser?.uid)
//                             .map((user) => (
//                                 <div
//                                     key={user.uid}
//                                     onClick={() => {
//                                         handleSelect(user)
//                                         setSelectedChat(user);
//                                     }}
//                                     className='flex gap-4 py-2 px-4 hover:bg-c5 rounded-xl
//                                         cursor-pointer items-center'
//                                 >
//                                     <Avatar size="large" user={user} />
//                                     <div className='flex flex-col gap-1 grow'>
//                                         <span className='text-white text-base'>
//                                             <div className='font-medium'>{`${user.displayName} ${ currentUser?.uid === user?.uid ? "(You)" : "" }`}</div>
//                                         </span>
//                                         <p className='text-sm text-c3'>{user.email}</p>
//                                     </div>
//                                 </div>
//                             )) 
//                     }
//                 </div>
//             </div>
//         </PopupWrapper>
//     )
    
// }

// export default UsersPopup;