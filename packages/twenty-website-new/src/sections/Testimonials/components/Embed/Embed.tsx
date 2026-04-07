import { LazyEmbed } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const EmbedContainer = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(1)};
  height: 279px;
  overflow: hidden;
  position: relative;
  width: 198px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 476px;
    width: 336px;
  }
`;

const StyledIframe = styled(LazyEmbed)`
  border: none;
  height: 200%;
  left: 51.5%;
  mix-blend-mode: difference;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
`;

const PlusOverlay = styled.div`
  background-color: ${theme.colors.highlight[100]};
  inset: 0;
  mix-blend-mode: plus-lighter;
  pointer-events: none;
  position: absolute;
`;

type EmbedProps = {
  illustration: IllustrationType;
};

export function Embed({ illustration }: EmbedProps) {
  return (
    <EmbedContainer>
      <StyledIframe
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        src={illustration.src}
        title={illustration.title}
      />
      <PlusOverlay aria-hidden="true" />
    </EmbedContainer>
  );
}
