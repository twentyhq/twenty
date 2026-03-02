import React, { useContext } from 'react';

import { styled } from '@linaria/react';

import { IconCheck } from '@ui/display/icon/components/TablerIcons';
import { ThemeContext, themeCssVariables } from '@ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.blue};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer className={className}>
      <IconCheck color={theme.grayScale.gray1} size={14} />
    </StyledContainer>
  );
};
