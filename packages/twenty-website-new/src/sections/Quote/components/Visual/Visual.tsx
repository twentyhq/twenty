import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const VisualContainer = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border-radius: ${theme.radius(1)};
  height: min(544px, 70vw);
  min-height: ${theme.spacing(80)};
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 544px;
    max-width: 646px;
  }
`;

const StyledIframe = styled.iframe`
  border: none;
  height: 200%;
  left: 51.5%;
  mix-blend-mode: lighten;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
`;

const HueOverlay = styled.div`
  background-color: ${theme.colors.highlight[100]};
  inset: 0;
  mix-blend-mode: hue;
  pointer-events: none;
  position: absolute;
`;

type VisualProps = {
  illustration: IllustrationType;
};

export function Visual({ illustration }: VisualProps) {
  return (
    <VisualContainer>
      <StyledIframe
        src={illustration.src}
        title={illustration.title}
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <HueOverlay aria-hidden="true" />
    </VisualContainer>
  );
}
