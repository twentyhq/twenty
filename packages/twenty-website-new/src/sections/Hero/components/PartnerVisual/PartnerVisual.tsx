import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const StyledContainer = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  height: 462px;
  margin-top: ${theme.spacing(6)};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const partnerHeroImageClassName = css`
  object-fit: contain;
  object-position: center;
`;

export function PartnerVisual() {
  return (
    <StyledContainer>
      <NextImage
        alt="Twenty partners"
        className={partnerHeroImageClassName}
        fill
        priority
        sizes="100vw"
        src="/images/partner/hero/hero.png"
      />
    </StyledContainer>
  );
}
