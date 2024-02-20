import { auth, db, dbt } from "@/firebase/firebase";
import { profileColors } from "@/utils/constants";
import { getDoc, doc, setDoc, arrayRemove, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref as rtdbRef, set, onValue, onDisconnect, serverTimestamp } from "firebase/database";

const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState(false);
    const [editMsg, setEditMsg] = useState(null);
    const [isTyping, setIsTyping] = useState(null);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [attachment, setAttachment] = useState(null);
    const [imageViewer, setImageViewer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);

    const resetFooterStates = () => {
        setInputText("");
        setAttachment(null);
        setAttachmentPreview(null);
        setEditMsg(null);
        setImageViewer(null);
    }

    const INITIAL_STATE = {
        chatId: "",
        user: null
    }

    const chatReducer = (state, action) => {
        switch(action.type) {
            case "CHANGE_USER" :
                return {
                    user: action.payload,
                    chatId: currentUser?.uid > action.payload?.uid ? 
                            currentUser?.uid + action.payload?.uid
                            :
                            action.payload?.uid + currentUser?.uid
                }
            case "EMPTY":
                return INITIAL_STATE;
            default : 
                return state
        }
    }

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    const clear = async () => {
        try {
            setChats([]);
            setUsers(false);
            state.chatId = "",
            state.user = null;
            setIsLoading(false);
            setCurrentUser(null);
            setSelectedChat(null);
        } catch (error) {
            console.error(error);
        }
    }

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, gProvider).then(async (data) => {
                const userDoc = await getDoc(doc(db, "users", data?.user?.reloadUserInfo.localId));
                if(!userDoc.exists()){
                    const colorIndex = Math.floor(Math.random() * profileColors.length);
                    await setDoc(doc(db, "users", data?.user?.reloadUserInfo.localId), {
                        uid: data?.user?.reloadUserInfo.localId,
                        displayName: data?.user?.reloadUserInfo.displayName,
                        email: data?.user?.reloadUserInfo.email,
                        color: profileColors[colorIndex],
                        photoURL: data?.user?.reloadUserInfo?.photoUrl,
                    })        
                    await setDoc(doc(db, "userChats", data?.user?.reloadUserInfo.localId), {});
                }
            });
        } catch (error) {
          console.error(error);
        }
    }

    const signInWithFacebook = async () => {
        try {
          await signInWithPopup(auth, fProvider).then(async (data) => {
            console.log(data);
          });
        } catch (error) {
          console.error(error);
        }
    }

    const authStateChanged = ( user ) => {
        setIsLoading(true);
        if(!user) {
            clear();
            return;
        }
        
        setTimeout(async() => {
            const userDoc = await getDoc(doc(db, "users", user.uid));    
            const connectedRef = rtdbRef(dbt, ".info/connected");
            const myConnectionsRef = rtdbRef(dbt, `status/` + user.uid);
            var isOnlineForDatabase = {
                state: 'connected',
                last_changed: serverTimestamp(),
            };
            var isOfflineForDatabase = {
                state: 'disconnected',
                last_changed: serverTimestamp(),
            };
            onValue(connectedRef, (snap) => {
                if (snap.val() == false) {
                    return;
                }
                onDisconnect(myConnectionsRef).set(isOfflineForDatabase).then(() => {
                    set(myConnectionsRef, isOnlineForDatabase);
                });
            });
            setCurrentUser(userDoc.data());        
            setIsLoading(false);
          }, 1000);
    }

    const signOut = () => {
        authSignOut(auth).then(() => {
            const myConnectionsRef = rtdbRef(dbt, `status/` + currentUser.uid);
            const runThis = async () => {
                await updateDoc(doc(db, "users", selectedChat?.uid),{
                    selectedChat: arrayRemove(currentUser.uid),
                });
            }
            runThis();
            var isOfflineForDatabase = {
                state: 'disconnected',
                last_changed: serverTimestamp(),
            };
            set(myConnectionsRef, isOfflineForDatabase);
            clear();
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, authStateChanged);
        return () => unsubscribe();
        //eslint-disable-next-line
    }, []);

    // useEffect(() => {
    //     Object.values(users).map((user) => {
    //         const myConnectionsRef = rtdbRef(dbt, `status/` + user?.uid);
    //         onValue(myConnectionsRef, (snapshot) => {
    //             const data = snapshot.val();
    //             if(data?.state === "connected"){
    //                 updateDoc(doc(db, "users", user?.uid), {
    //                     online: true,
    //                     last_changed: data?.last_changed || serverTimestamp(),
    //                 });
    //             }else{
    //                 updateDoc(doc(db, "users", user?.uid), {
    //                     online: false,
    //                     last_changed: data?.last_changed || serverTimestamp(),
    //                 });
    //             }
    //         });
    //     })
    //     //eslint-disable-next-line
    // }, [users])

    return (
        <UserContext.Provider value={{
            currentUser, setCurrentUser,
            isLoading, setIsLoading,
            signOut, users, setUsers, 
            setChats, chats, selectedChat,
            setSelectedChat, state, dispatch,
            signInWithGoogle, isTyping, setIsTyping,
            inputText, setInputText, signInWithFacebook,
            imageViewer, setImageViewer, editMsg, setEditMsg,
            attachment, setAttachment, attachmentPreview, setAttachmentPreview,
            resetFooterStates,
        }}>
            {children}
        </UserContext.Provider>
    )

}

export const useAuth = () => useContext(UserContext);