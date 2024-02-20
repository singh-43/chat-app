import React, { useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import LeftNav from '@/components/LeftNav';
import Chats from '@/components/Chats';
import Chat from '@/components/Chat';
import { useChatContext } from '@/context/chatContext';

const Home = () => {

  const router = useRouter();
  const { data } = useChatContext();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if(!isLoading && !currentUser){
      router.push("/login");
    }
    //eslint-disable-next-line
  }, [currentUser, isLoading])

  return !currentUser ?
    <Loader />
    :
    (
      <div className='h-[100vh] bg-c1 flex'>
        <div className='shrink-0 flex w-full'>
          <LeftNav />
          <div className='bg-c2 grow flex'>
            <div className='w-[350px] border-r border-white/[0.05]
              scrollbar p-5 shrink-0 overflow-auto'>
                <div className='h-full flex flex-col'>
                  <Chats />
                </div>
            </div>
            {data.user && <Chat />}
          </div>
        </div>
      </div>
    )
}

export default Home;