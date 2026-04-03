import { LazyEmbed } from '@/design-system/components';
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

const StyledIllustrationEmbed = styled(LazyEmbed)`
  border: none;
  display: block;
  height: 462px;
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
      <StyledIllustrationEmbed
        eager
        src={illustration.src}
        title={illustration.title}
        unloadWhenHidden={false}
        allow="clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          backgroundColor: backgroundColor,
        }}
      />
    </StyledIllustrationContainer>
  );
}
