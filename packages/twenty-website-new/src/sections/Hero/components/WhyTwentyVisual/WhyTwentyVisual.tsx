import { Image } from '@/design-system/components';
import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { ImageType } from '@/design-system/components/Image/types/Image';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const VisualContainer = styled.div`
  border-radius: ${theme.radius(1)};
  height: 462px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledBackground = styled(Image)`
  aspect-ratio: auto;
  height: 100%;
`;

const StyledIframe = styled.iframe`
  border: none;
  height: 200%;
  mix-blend-mode: lighten;
  position: absolute;
  top: 50%;
  left: 51.5%;
  transform: translate(-50%, -50%);
  width: 200%;
`;

type WhyTwentyVisualProps = {
  image: ImageType;
  illustration: IllustrationType;
};

export function WhyTwentyVisual({ image, illustration }: WhyTwentyVisualProps) {
  return (
    <VisualContainer>
      <StyledBackground src={image.src} alt={image.alt} />
      <StyledIframe
        src={illustration.src}
        title={illustration.title}
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </VisualContainer>
  );
}
