import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconInfoCircle } from '@ui/display/icon/components/TablerIcons';

import { Button } from '@ui/input/button/components/Button';
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
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconInfoCircle = styled(IconInfoCircle)`
  flex-shrink: 0;
`;

const StyledInfo = styled.div<Pick<InfoProps, 'accent'>>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  max-width: 512px;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  ${({ theme, accent }) => {
    switch (accent) {
      case 'blue':
        return css`
          background: ${theme.color.blueAccent20};
          color: ${theme.color.blue50};
        `;
      case 'danger':
        return css`
          background: ${theme.color.red10};
          color: ${theme.color.red};
        `;
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
