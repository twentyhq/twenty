'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { spacing } from '@/tokens';

const ClientLogoImage = styled.img`
  display: block;
  filter: brightness(0);
  height: ${spacing(5.5)};
  max-width: ${spacing(28)};
  object-fit: contain;
  object-position: left center;
  opacity: 0.72;
  width: auto;

  [data-scheme='dark'] & {
    filter: brightness(0) invert(1);
    opacity: 0.78;
  }
`;

export function ClientLogo({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <ClientLogoImage
      alt={alt}
      src={src}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
