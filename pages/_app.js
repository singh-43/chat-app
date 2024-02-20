import { UserProvider } from '@/context/authContext';
import { ChatContextProvider } from '@/context/chatContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return  (
    <UserProvider>
      <ChatContextProvider>
        <Component {...pageProps} />
      </ChatContextProvider>
    </UserProvider>
  )
}
