'use client';

import Image from 'next/image';

export const ClaudeLogo = ({ size = 14 }: { size?: number }) => {
  return (
    <Image
      alt=""
      aria-hidden
      draggable={false}
      height={size}
      src="/images/shared/companies/logos/claude.png"
      style={{ display: 'block' }}
      width={size}
    />
  );
};
