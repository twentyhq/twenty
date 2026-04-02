'use client';

import { LazyEmbed } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { styled } from '@linaria/react';
import type { ComponentPropsWithoutRef } from 'react';
import { FooterBackgroundCanvasRoot } from './FooterBackgroundCanvasRoot';

const FooterBackgroundEmbed = styled(LazyEmbed)`
  border: none;
  display: block;
  height: 100%;
  width: 100%;
`;

type FooterBackgroundCanvasProps = ComponentPropsWithoutRef<'div'> & {
  illustration: IllustrationType;
};

export function FooterBackgroundCanvas({
  illustration,
  ...rest
}: FooterBackgroundCanvasProps) {
  return (
    <FooterBackgroundCanvasRoot {...rest}>
      <FooterBackgroundEmbed
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        rootMargin="200px 0px"
        src={illustration.src}
        title={illustration.title}
      />
    </FooterBackgroundCanvasRoot>
  );
}
