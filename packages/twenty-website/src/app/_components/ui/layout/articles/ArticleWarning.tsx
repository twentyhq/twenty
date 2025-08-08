'use client';
import { type ReactNode } from 'react';
import styled from '@emotion/styled';
import { IconAlertCircle } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  background: var(--Palette-Red-10, #feecec);
  gap: 12px;
  border-radius: 8px;
  padding: 16px 24px;
  margin: 32px 0px;
`;

const StyledIconContainer = styled.div`
  color: var(--Palette-Red-50, #b43232);
  padding-top: 1px;
`;

const StyledText = styled.div`
  h1 {
    margin: 0px !important;
  }
  p {
    color: var(--Palette-Red-50, #b43232) !important;
    margin: 0px !important;
    text-align: left;
  }
`;

export default function ArticleWarning({ children }: { children: ReactNode }) {
  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconAlertCircle />
      </StyledIconContainer>
      <StyledText>{children}</StyledText>
    </StyledContainer>
  );
}
