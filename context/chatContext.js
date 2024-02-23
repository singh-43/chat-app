import { createContext, useContext, useRef, useState } from "react";
import { useAuth } from "./authContext";

const chatContext = createContext();

export const ChatContextProvider = ({children}) => {

    const { users, isTyping, setIsTyping, editMsg, setEditMsg,  
            attachment, setAttachment, attachmentPreview, setAttachmentPreview,
            imageViewer, setImageViewer, state, dispatch, setSelectedChat, 
            setUsers, selectedChat, chats, setChats, inputText, 
            setInputText, resetFooterStates, } = useAuth();

    const [unread, setUnread] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileExt, setFileExt] = useState("");
    const [fileSize, setFileSize] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <chatContext.Provider value={{
            users, setUsers,
            data: state,
            dispatch, selectedChat, setSelectedChat,
            chats, setChats, isTyping, setIsTyping,
            attachment, setAttachment, attachmentPreview,
            setAttachmentPreview, imageViewer, setImageViewer,
            editMsg, setEditMsg, inputText, setInputText,
            resetFooterStates, unread, setUnread,
            fileType, setFileType, fileName, setFileName,
            fileExt, setFileExt, fileSize, setFileSize,
            loading, setLoading,
        }}>
            {children}
        </chatContext.Provider>
    )
}

export const useChatContext = () => useContext(chatContext);

// import { createContext, useContext, useReducer, useState } from "react";
// import { useAuth } from "./authContext";

// const chatContext = createContext();

// export const ChatContextProvider = ({children}) => {

//     const [users, setUsers] = useState(false);
//     const [chats, setChats] = useState([]);
//     const [selectedChat, setSelectedChat] = useState(null);
//     const { currentUser } = useAuth();

//     const INITIAL_STATE = {
//         chatId: "",
//         user: null
//     }

//     const chatReducer = (state, action) => {
//         switch(action.type) {
//             case "CHANGE_USER" :
//                 return {
//                     user: action.payload,
//                     chatId: currentUser?.uid > action.payload?.uid ? 
//                             currentUser?.uid + action.payload?.uid
//                             :
//                             action.payload?.uid + currentUser?.uid
//                 }
//             default : 
//                 return state
//         }
//     }

//     const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

//     return (
//         <chatContext.Provider value={{
//             users, setUsers,
//             data: state,
//             dispatch, selectedChat, setSelectedChat,
//             chats, setChats,
//         }}>
//             {children}
//         </chatContext.Provider>
//     )
// }

// export const useChatContext = () => useContext(chatContext);