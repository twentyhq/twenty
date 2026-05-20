import { Body as BaseBody } from '@/design-system/components';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledBody = styled(BaseBody)`
  max-width: 668px;
`;

type BodyProps = {
  children: ReactNode;
};

export function Body({ children }: BodyProps) {
  return (
    <StyledBody size="sm" weight="regular">
      {children}
    </StyledBody>
  );
}
