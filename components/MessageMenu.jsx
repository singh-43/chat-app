import React, { useEffect, useRef } from 'react';
import ClickAwayListener from 'react-click-away-listener';

const MessageMenu = ({self, diff, setShowMenu, setEditMsg, showMenu, deletePopupHandler}) => {
    
    const ref = useRef();
    const handleClickAway = () => {
        setShowMenu(false);
    };

    useEffect(() => {
        ref?.current?.scrollIntoViewIfNeeded();
    }, [showMenu])

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                ref={ref}
                className={`w-[200px] absolute bg-c0 rounded-md
                overflow-hidden top-9 z-20 ${self ? "right-7" : "left-7"}`}>
                <ul className='flex flex-col py-2 px-2'>
                    {self && diff < 900000 && (<li 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditMsg();
                            setShowMenu(false);
                        }}
                        className='flex items-center py-3 px-5 rounded-md hover:bg-black cursor-pointer'>
                        edit message
                    </li>)}
                    <li className='flex items-center py-3 px-5 rounded-md hover:bg-black cursor-pointer'
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePopupHandler(true);
                        }}
                    >
                        delete message
                    </li>
                </ul>
            </div>
        </ClickAwayListener>
    )
}

export default MessageMenu;