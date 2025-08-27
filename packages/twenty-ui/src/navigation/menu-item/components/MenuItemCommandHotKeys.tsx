import { styled } from '@linaria/react';
import React from 'react';

const StyledCommandTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  justify-content: center;
`;

const StyledCommandText = styled.div`
  color: var(--font-color-light);
  vertical-align: middle;
  white-space: nowrap;
`;

const StyledCommandKey = styled.div`
  align-items: center;
  background-color: var(--background-secondary);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow-underline);
  display: flex;
  flex-direction: column;

  height: var(--spacing-5);
  height: 18px;
  justify-content: center;
  text-align: center;
  width: var(--spacing-4);
`;

export type MenuItemCommandHotKeysProps = {
  hotKeys?: string[];
  joinLabel?: string;
};

export const MenuItemCommandHotKeys = ({
  hotKeys,
  joinLabel = 'then',
}: MenuItemCommandHotKeysProps) => {
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
