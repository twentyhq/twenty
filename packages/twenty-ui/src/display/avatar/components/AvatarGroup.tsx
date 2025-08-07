import styled from '@emotion/styled';
import { type ReactNode } from 'react';

export type AvatarGroupProps = {
  avatars: ReactNode[];
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledItemContainer = styled.div`
  margin-right: -3px;

  &:last-child {
    margin-right: 0;
  }
`;

const MAX_AVATARS_NB = 4;

export const AvatarGroup = ({ avatars }: AvatarGroupProps) => {
  if (!avatars.length) return null;

  return (
    <StyledContainer>
      {avatars.slice(0, MAX_AVATARS_NB).map((avatar, index) => (
        <StyledItemContainer key={index}>{avatar}</StyledItemContainer>
      ))}
    </StyledContainer>
  );
};
