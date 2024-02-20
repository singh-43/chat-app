import { useChatContext } from '@/context/chatContext';
import React, { useState } from 'react';
import Avatar from './Avatar';
import { formatDateLastSeen } from '@/utils/helpers';
import { useAuth } from '@/context/authContext';
import Icons from './Icons';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import ChatMenu from './ChatMenu';
import Image from 'next/image';

const ChatHeader = () => {

    const { currentUser } = useAuth();
    const { users, data, isTyping } = useChatContext();
    const user = users[data?.user?.uid];
    const online = users[user?.uid]?.online;
    const [showMenu, setShowMenu] = useState(false);
    const lastSeen = new Date(users[data?.user.uid]?.last_changed);

    return (
        <div className='flex justify-between items-center pb-5 border-b border-white/[0.05]
            '>
            {
                user && 
                <div className='flex items-center gap-3'>
                    <Avatar size="large" user={user} />
                    <div>
                    <div className='font-medium'>{`${user.displayName} ${ currentUser?.uid === user?.uid ? "(You)" : "" }`}</div>
                        <p className='text-sm text-c3'>
                            { isTyping && currentUser.uid !== user.uid ?
                                <p className='flex gap-1 w-full h-full opacity-50 texts text-white'>
                                    {`typing`}
                                    <Image width={20} height={100} src='/typing.svg' alt='Typing...'/>
                                </p>
                                : online ? currentUser?.uid === user?.uid ? "Message yourself" : "online" : `${formatDateLastSeen(lastSeen)}`}
                        </p>
                        {/* <p className='text-sm text-c3'>{ online ? currentUser?.uid === user?.uid ? "Message yourself" : "online" : `${formatDateLastSeen(lastSeen)}`}</p> */}
                    </div>
                </div>
            }
            <div className='flex items-center gap-2'>
                <Icons
                    size="large"
                    icon={<IoEllipsisVerticalSharp size={20} 
                            className='text-c3'    
                        />}
                    onClick={() => setShowMenu(true)}
                    className={`${showMenu ? "bg-c1" : ""} hover:bg-c1`}
                />
                {showMenu && <ChatMenu setShowMenu={setShowMenu} showMenu={showMenu} />}
            </div>
        </div>
    )
}

export default ChatHeader;