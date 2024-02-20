import React from 'react';
import PopupWrapper from './PopupWrapper';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { RiErrorWarningLine } from 'react-icons/ri';
import { DELETED_FOR_EVERYONE, DELETED_FOR_ME } from '@/utils/constants';

const DeleteMgsPopup = (props) => {

    const { currentUser } = useAuth();
    const { selectedChat } = useChatContext();

    return (
        <PopupWrapper {...props}>
            <div className='mt-8 mb-5'>
                <div className='flex items-center justify-center gap-3'>
                    <RiErrorWarningLine size={24} className='text-red-500' />
                    <div className='text-lg'>Are you sure, you want to delete the message ?</div>
                </div>
                <div className='flex items-center justify-center gap-2 mt-5'>
                    <button 
                        onClick={() => props.deleteMessage(DELETED_FOR_ME)}
                        className='border-[2px] border-red-700 py-2 px-4
                        text-sm rounded-md text-red-500 hover:bg-red-700 hover:text-white'>
                            {`${(props.self && selectedChat.uid !== currentUser.uid) ? "Delete for me" : "Confirm"}`}
                    </button>
                    {(props.self && selectedChat.uid !== currentUser.uid) && (<button 
                        onClick={() => props.deleteMessage(DELETED_FOR_EVERYONE)}
                        className='border-[2px] border-red-700 py-2 px-4
                        text-sm rounded-md text-red-500 hover:bg-red-700 hover:text-white'>
                            Delete for everyone
                    </button>)}
                    <button 
                        onClick={props.onHide}
                        className='border-[2px] border-white py-2 px-4
                        text-sm rounded-md text-white hover:bg-white hover:text-black'>
                            Cancel
                    </button>
                </div>
            </div>
        </PopupWrapper>
    )
    
}

export default DeleteMgsPopup;