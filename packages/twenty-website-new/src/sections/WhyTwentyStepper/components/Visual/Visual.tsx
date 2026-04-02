import { LazyEmbed } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const VisualColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
    position: sticky;
    top: ${theme.spacing(10)};
  }
`;

const VisualContainer = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border-radius: ${theme.radius(1)};
  height: min(705px, 70vw);
  min-height: ${theme.spacing(80)};
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 705px;
    max-width: 672px;
  }
`;

const StyledIframe = styled(LazyEmbed)`
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
    <VisualColumn>
      <VisualContainer>
        <StyledIframe
          allow="clipboard-write; encrypted-media; gyroscope; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          src={illustration.src}
          title={illustration.title}
        />
        <HueOverlay aria-hidden="true" />
      </VisualContainer>
    </VisualColumn>
  );
}
