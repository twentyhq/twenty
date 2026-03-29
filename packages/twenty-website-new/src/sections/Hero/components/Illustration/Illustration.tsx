import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledIllustrationContainer = styled.div`
  justify-self: stretch;
  margin-top: ${theme.spacing(6)};
  max-width: 100%;
  min-width: 0;
  width: 100%;
`;

type IllustrationProps = {
  illustration: IllustrationType;
  backgroundColor: string;
};

export function Illustration({
  illustration,
  backgroundColor,
}: IllustrationProps) {
  return (
    <StyledIllustrationContainer>
      <iframe
        src={illustration.src}
        title={illustration.title}
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height: '462px',
          border: 'none',
          backgroundColor: backgroundColor,
          display: 'block',
        }}
      />
    </StyledIllustrationContainer>
  );
}
