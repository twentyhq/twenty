import { styled } from '@linaria/react';
import React, { useContext } from 'react';

import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledCommandTextContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
`;

const StyledCommandText = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.light};
  vertical-align: middle;
  white-space: nowrap;
`;

const StyledCommandKey = styled.div<{ theme: ThemeType }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.underline};
  display: flex;
  flex-direction: column;
  height: 18px;
  justify-content: center;
  text-align: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

export type MenuItemHotKeysProps = {
  hotKeys?: string[];
  joinLabel?: string;
};

export const MenuItemHotKeys = ({
  hotKeys,
  joinLabel = 'then',
}: MenuItemHotKeysProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCommandText theme={theme}>
      {hotKeys && (
        <StyledCommandTextContainer theme={theme}>
          {hotKeys.map((hotKey, index) => (
            <React.Fragment key={index}>
              <StyledCommandKey theme={theme}>{hotKey}</StyledCommandKey>
              {index < hotKeys.length - 1 && joinLabel}
            </React.Fragment>
          ))}
        </StyledCommandTextContainer>
      )}
    </StyledCommandText>
  );
};
