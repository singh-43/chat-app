import React from 'react';
import Icons from '../Icons';
import { IoClose } from 'react-icons/io5';
import { handleDragStart } from '@/utils/helpers';

const PopupWrapper = (props) => {
  return (
    <div className='h-full w-full fixed top-0 left-0 z-20
        flex justify-center items-center select-none'
        onDragStart={handleDragStart}    
    >
        <div className='w-full h-full absolute glass-effect'
            onClick={props.onHide}
        ></div>
        <div className={`relative w-[600px] max-h-[80%]
            bg-c2 rounded-3xl z-10 flex flex-col ${props.shortHeight ? "" : "min-h-[600px]"}`}>
            { !props.noHeader && <div className='flex p-6 items-center justify-between
                shrink-0'>
                <div className='text-lg font-semibold'>
                    {props.title || ""}
                </div>
                <Icons
                    size="small"
                    icon={<IoClose size={20} />}
                    className="cursor-pointer"
                    onClick={props.onHide}
                />
            </div>}
            <div className='p-6 pt-0 flex flex-col grow'>
                {props.children}
            </div>
        </div>
    </div>
  )
}

export default PopupWrapper;