import React from 'react';
import PopupWrapper from './PopupWrapper';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { RiErrorWarningLine } from 'react-icons/ri';

const BlockMsgPopUp = (props) => {

    const { currentUser } = useAuth();
    const { users, data } = useChatContext();

    const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => u === data?.user?.uid);

    return (
        <PopupWrapper {...props}>
            <div className='mt-8 mb-5'>
                <div className={`flex items-center justify-center gap-3 ${ isUserBlocked ? null : "mb-3" }`}>
                    <RiErrorWarningLine size={24} className='text-red-500' />
                    <div className={`${ isUserBlocked ? "text-md" : "text-lg" }`}>
                        { `${ isUserBlocked ? ` Unblock ${data?.user?.displayName} to send a message.` : `Block ${data?.user?.displayName} ?` }`}
                    </div>
                </div>
                {
                    !isUserBlocked && <div className='text-md text-center'>
                        Blocked users cannot send you messages. The user will not be notified.
                    </div>
                }
                <div className='flex items-center justify-center gap-2 mt-5'>
                    <button 
                        onClick={() => {
                            if(isUserBlocked){
                                props.handleBlock("unblock");
                            }else{
                                props.handleBlock("block");
                            }
                            props.onHide();
                        }}
                        className='border-[2px] border-red-700 py-2 px-4
                        text-sm rounded-md text-red-500 hover:bg-red-700 hover:text-white'>
                            {`${ isUserBlocked ? "Unblock" : "Confirm"}`}
                    </button>
                    <button 
                        onClick={() => {
                            props.onHide();
                        }}
                        className='border-[2px] border-white py-2 px-4
                        text-sm rounded-md text-white hover:bg-white hover:text-black'>
                            Cancel
                    </button>
                </div>
            </div>
        </PopupWrapper>
    )
    
}

export default BlockMsgPopUp;