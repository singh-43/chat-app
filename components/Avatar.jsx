import { useAuth } from '@/context/authContext';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/chatContext';
import { db, dbt } from '@/firebase/firebase';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { ref as rtdbRef, onValue, serverTimestamp } from 'firebase/database';

const Avatar = ({user, size, onClick}) => {

    const { currentUser } = useAuth();
    const { users } = useChatContext();
    let online = users[user?.uid]?.online;

    const s = size === "small" ? 32 : size === "medium" ? 36 : size === "x-large"
        ? 56 : size === "xx-large" ? 96 : 40;

    const c = size === "small" ? "w-8 h-8" : size === "medium" ? "w-9 h-9" :
        size === "large" ? "w-10 h-10" : size === "x-large" ? "w-14 h-14" :
        "w-24 h-24";

    const f = size === "x-large" ? "text-2xl" : size === "xx-large" ? "text-4xl"
        : "text-base";

    useEffect(() => {
        const myConnectionsRef = rtdbRef(dbt, `status/` + user?.uid);
        onValue(myConnectionsRef, (snapshot) => {
            const data = snapshot.val();
            if(data?.state === "connected"){
                updateDoc(doc(db, "users", user?.uid), {
                    online: true,
                    last_changed: data?.last_changed || serverTimestamp(),
                });
            }else{
                updateDoc(doc(db, "users", currentUser?.uid),{
                    selectedChat: arrayRemove(user?.uid),
                })
                updateDoc(doc(db, "users", user?.uid), {
                    online: false,
                    last_changed: data?.last_changed || serverTimestamp(),
                });
            }
        });
        //eslint-disable-next-line
    }, [])

    return (
        <div className={`${c} text-base rounded-full flex items-center justify-center
            shrink-0 relative`}
            style={{backgroundColor: user?.color}}
            onClick={onClick}
        >
            {
                online && user?.uid !== currentUser?.uid 
                && (<>
                    {size === "large" && <span className='w-[10px] h-[10px] bg-green-500
                        absolute bottom-[2px] right-[2px] rounded-full'></span>}
                    
                    {size === "x-large" && <span className='w-[12px] h-[12px] bg-green-500
                        absolute bottom-[3px] right-[3px] rounded-full'></span>}
                </>) 
            }

            {user?.photoURL ? (
                <div className={`${c} overflow-hidden rounded-full`}>
                    <Image 
                        src={user?.photoURL}
                        alt='User Avatar'
                        width={s}
                        height={s}
                        className=''
                    />
                </div>
            ) : (
                <div className={`uppercase font-semibold text-black ${f}`}>
                    {user?.displayName?.charAt(0)}
                </div>
            )}
        </div>
    )
}

export default Avatar;