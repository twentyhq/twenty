import { styled } from '@linaria/react';
import React from 'react';

import { theme } from '@ui/theme';

const StyledCommandTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing[1]};
  justify-content: center;
`;

const StyledCommandText = styled.div`
  color: ${theme.font.color.light};
  vertical-align: middle;
  white-space: nowrap;
`;

const StyledCommandKey = styled.div`
  align-items: center;
  background-color: ${theme.background.secondary};
  border: 1px solid ${theme.border.color.strong};
  border-radius: ${theme.border.radius.sm};
  box-shadow: ${theme.boxShadow.underline};
  display: flex;
  flex-direction: column;
  height: 18px;
  justify-content: center;
  text-align: center;
  width: ${theme.spacing[4]};
`;

export type MenuItemHotKeysProps = {
  hotKeys?: string[];
  joinLabel?: string;
};

export const MenuItemHotKeys = ({
  hotKeys,
  joinLabel = 'then',
}: MenuItemHotKeysProps) => {
  return (
    <StyledCommandText>
      {hotKeys && (
        <StyledCommandTextContainer>
          {hotKeys.map((hotKey, index) => (
            <React.Fragment key={index}>
              <StyledCommandKey>{hotKey}</StyledCommandKey>
              {index < hotKeys.length - 1 && joinLabel}
            </React.Fragment>
          ))}
        </StyledCommandTextContainer>
      )}
    </StyledCommandText>
  );
};
