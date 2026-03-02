import { styled } from '@linaria/react';
import { IconInfoCircle } from '@ui/display/icon/components/TablerIcons';
import { ThemeContext, themeCssVariables } from '@ui/theme';

import { Button } from '@ui/input/button/components/Button/Button';
import React, { useContext } from 'react';
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
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconInfoCircle = styled(IconInfoCircle)`
  flex-shrink: 0;
`;

const StyledInfo = styled.div<Pick<InfoProps, 'accent'>>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: space-between;
  max-width: 512px;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return themeCssVariables.color.blue5;
      case 'danger':
        return themeCssVariables.color.red3;
      default:
        return 'transparent';
    }
  }};
  color: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return themeCssVariables.color.blue10;
      case 'danger':
        return themeCssVariables.color.red;
      default:
        return 'inherit';
    }
  }};
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
  const { theme } = useContext(ThemeContext);
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
            size="small"
            variant="secondary"
            accent={accent}
          />
        </StyledLink>
      )}
      {buttonTitle && onClick && !to && (
        <Button
          title={buttonTitle}
          onClick={onClick}
          size="small"
          variant="secondary"
          accent={accent}
        />
      )}
    </StyledInfo>
  );
};
