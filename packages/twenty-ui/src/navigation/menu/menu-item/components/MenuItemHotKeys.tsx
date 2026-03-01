import { styled } from '@linaria/react';
import React from 'react';

import { themeCssVariables } from '@ui/theme';

const StyledCommandTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

const StyledCommandText = styled.div`
  color: ${themeCssVariables.font.color.light};
  vertical-align: middle;
  white-space: nowrap;
`;

const StyledCommandKey = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.underline};
  display: flex;
  flex-direction: column;
  height: 18px;
  justify-content: center;
  text-align: center;
  width: ${themeCssVariables.spacing[4]};
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
