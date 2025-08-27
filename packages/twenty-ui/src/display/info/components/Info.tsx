import { useTheme } from '@emotion/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconInfoCircle } from '@ui/display/icon/components/TablerIcons';

import { Button } from '@ui/input/button/components/Button/Button';
import React from 'react';
import { Link } from 'react-router-dom';

export type InfoAccent = 'blue' | 'danger';
export type InfoProps = {
  accent?: InfoAccent;
  text: string;
  buttonTitle?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
};

const StyledTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
`;

const StyledIconInfoCircle = styled(IconInfoCircle)`
  flex-shrink: 0;
`;

const StyledInfo = styled.div<Pick<InfoProps, 'accent'>>`
  align-items: center;
  border-radius: var(--border-radius-md);
  display: flex;
  font-weight: var(--font-weight-medium);
  justify-content: space-between;
  max-width: 512px;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return css`
          background: var(--color-blue-accent-20);
          color: var(--color-blue-50);
        `;
      case 'danger':
        return css`
          background: var(--color-red-10);
          color: var(--color-red);
        `;
      default:
        return css``;
    }
  }}
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const Info = ({
  accent = 'blue',
  text,
  buttonTitle,
  onClick,
  to,
}: InfoProps) => {
  const theme = useTheme();
  return (
    <StyledInfo accent={accent}>
      <StyledTextContainer>
        <StyledIconInfoCircle size={theme.icon.size.md} />
        {text}
      </StyledTextContainer>
      {buttonTitle && to && (
        <StyledLink to={to}>
          <Button
            title={buttonTitle}
            size={'small'}
            variant={'secondary'}
            accent={accent}
          />
        </StyledLink>
      )}
      {buttonTitle && onClick && !to && (
        <Button
          title={buttonTitle}
          onClick={onClick}
          size={'small'}
          variant={'secondary'}
          accent={accent}
        />
      )}
    </StyledInfo>
  );
};
