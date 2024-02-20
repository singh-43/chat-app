import Image from 'next/image';
import React from 'react';

const Loader = () => {
  return (
    <div className='fixed top-0 left-0 h-full w-full flex items-center justify-center'>
        <Image 
            src="/loader.svg"
            alt='Loading...'
            width={100}
            height={100}
            priority={true}
        />
    </div>
  )
}

export default Loader;