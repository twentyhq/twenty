'use client';

import { LazyEmbed } from '@/design-system/components';
import { styled } from '@linaria/react';
import type { ComponentPropsWithoutRef } from 'react';
import { FooterBackgroundCanvasRoot } from './FooterBackgroundCanvasRoot';

const FOOTER_EMBED_PATH =
  '/illustrations/home/footer/footer.glb';

const FooterBackgroundEmbed = styled(LazyEmbed)`
  border: none;
  display: block;
  height: 100%;
  width: 100%;
`;

type FooterBackgroundCanvasProps = ComponentPropsWithoutRef<'div'>;

export function FooterBackgroundCanvas(props: FooterBackgroundCanvasProps) {
  return (
    <FooterBackgroundCanvasRoot {...props}>
      <FooterBackgroundEmbed
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        rootMargin="200px 0px"
        src={FOOTER_EMBED_PATH}
        title="Footer background"
      />
    </FooterBackgroundCanvasRoot>
  );
}
