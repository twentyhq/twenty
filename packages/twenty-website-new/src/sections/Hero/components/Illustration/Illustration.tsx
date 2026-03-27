import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledIllustrationContainer = styled.div`
  margin-top: ${theme.spacing(6)};
  width: 100%;
`;

type IllustrationProps = IllustrationType & {
  backgroundColor: string;
};

export function Illustration({
  src,
  title,
  backgroundColor,
}: IllustrationProps) {
  return (
    <StyledIllustrationContainer>
      <iframe
        src={src}
        title={title}
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          width: '100%',
          height: '462px',
          border: 'none',
          backgroundColor: backgroundColor,
          display: 'block',
        }}
      />
    </StyledIllustrationContainer>
  );
}
