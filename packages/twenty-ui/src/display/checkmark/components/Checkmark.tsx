import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';

import { IconCheck } from '@ui/display/icon/components/TablerIcons';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

export type CheckmarkProps = React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
};

export const Checkmark = ({ className }: CheckmarkProps) => {
  const theme = useTheme();

  return (
    <StyledContainer className={className}>
      <IconCheck color={theme.grayScale.gray1} size={14} />
    </StyledContainer>
  );
};
