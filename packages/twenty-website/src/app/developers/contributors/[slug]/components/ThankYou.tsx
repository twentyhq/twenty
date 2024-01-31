'use client';

import styled from '@emotion/styled';

import { HeartIcon } from '@/app/components/Icons';
import { CardContainer } from '@/app/developers/contributors/[slug]/components/CardContainer';

const StyledTitle = styled.div`
  display: flex;
  font-size: 24px;
  font-weight: 500;
  gap: 8px;

  @media (max-width: 810px) {
    font-size: 20px;
  }
`;

const StyledHeartIcon = styled(HeartIcon)`
  @media (max-width: 810px) {
    width: 16px !important;
    height: 16px !important;
  }
`;

interface ThankYouProps {
  authorId: string;
}

export const ThankYou = ({ authorId }: ThankYouProps) => {
  return (
    <CardContainer>
      <StyledTitle>
        Thank you @{authorId} <StyledHeartIcon color="#333333" size="18px" />
      </StyledTitle>
    </CardContainer>
  );
};
