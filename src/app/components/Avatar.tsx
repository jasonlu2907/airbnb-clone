'use client';
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null | undefined;
}

const Avatar = (props: AvatarProps) => {
  return (
    <Image
      className='rounded-full'
      height='30'
      width='30'
      alt='Avatar'
      src={props.src || '/images/placeholder.jpg'}
    />
  );
};

export default Avatar;
