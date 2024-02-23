import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import Messages from './Messages';
import { useChatContext } from '@/context/chatContext';
import ChatFooter from './ChatFooter';
import { useAuth } from '@/context/authContext';

const Chat = () => {

    const { currentUser } = useAuth();
    const { data, users } = useChatContext();
    const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => u === data?.user?.uid);

    return (
        <div className='flex flex-col p-5 grow select-none'>
            <ChatHeader />
            {data.chatId && <Messages />}
            { isUserBlocked && (<div className='w-full text-center text-c3 py-5'>You have blocked this user.</div>)}
            { <ChatFooter />}
        </div>
    )
}

export default Chat;