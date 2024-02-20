import React from 'react';
import PopupWrapper from './PopupWrapper';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { RiErrorWarningLine } from 'react-icons/ri';

const ClearDeleteChatPopUp = (props) => {

    return (
        <PopupWrapper {...props}>
            <div className='mt-8 mb-5'>
                <div className="flex items-center justify-center gap-3">
                    <RiErrorWarningLine size={24} className='text-red-500' />
                    <div className="text-md">
                        { `Are you sure you want to ${ !props.clearchatPopUp ? `delete` : `clear` } this chat.`}
                    </div>
                </div>
                <div className='flex items-center justify-center gap-2 mt-5'>
                    <button 
                        onClick={() => {
                            if(props.clearchatPopUp){
                                props.handleClearChat();
                            }else{
                                props.handleDeleteUser();
                            }
                            props.onHide();
                        }}
                        className='border-[2px] border-red-700 py-2 px-4
                        text-sm rounded-md text-red-500 hover:bg-red-700 hover:text-white'>
                            Confirm
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

export default ClearDeleteChatPopUp;