import { styled } from '@linaria/react';

import { color, semanticColor, spacing } from '@/tokens';

const SkeletonList = styled.div`
  border-top: 1px solid ${semanticColor.ink};
  margin-top: ${spacing(14)};
`;

const SkeletonRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(4)};
  padding: ${spacing(6)} 0;

  &::before {
    background-color: ${color('black-5')};
    content: '';
    flex-shrink: 0;
    height: 48px;
    width: 48px;
  }

  &::after {
    background-color: ${color('black-5')};
    content: '';
    height: 14px;
    width: min(60%, 420px);
  }
`;

// PROTOTYPE
export function PartnersStageDirectorySkeleton() {
  return (
    <SkeletonList aria-hidden>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </SkeletonList>
  );
}
