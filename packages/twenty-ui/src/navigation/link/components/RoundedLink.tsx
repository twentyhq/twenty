import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { FONT_COMMON, THEME_COMMON, ThemeContext } from '@ui/theme';
import { type MouseEvent, useContext } from 'react';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

const fontSizeMd = FONT_COMMON.size.md;
const spacing1 = THEME_COMMON.spacing(1);
const spacing2 = THEME_COMMON.spacing(2);

const spacingMultiplicator = THEME_COMMON.spacingMultiplicator;

const StyledLink = styled.a<{
  color: string;
  background: string;
  backgroundHover: string;
  backgroundActive: string;
  border: string;
}>`
  align-items: center;
  background-color: ${({ background }) => background};
  border: 1px solid ${({ border }) => border};

  border-radius: 50px;
  color: ${({ color }) => color};

  cursor: pointer;
  display: inline-flex;
  font-weight: ${fontSizeMd};

  gap: ${spacing1};

  height: 10px;
  justify-content: center;

  max-width: calc(100% - ${spacingMultiplicator} * 2px);

  min-width: fit-content;

  overflow: hidden;
  padding: ${spacing1} ${spacing2};

  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${({ backgroundHover }) => backgroundHover};
  }

  &:active {
    background-color: ${({ backgroundActive }) => backgroundActive};
  }
`;

export const RoundedLink = ({
  label,
  href,
  onClick,
  className,
}: RoundedLinkProps) => {
  const { theme } = useContext(ThemeContext);

  const background = theme.background.transparent.lighter;
  const backgroundHover = theme.background.transparent.light;
  const backgroundActive = theme.background.transparent.medium;
  const border = theme.border.color.strong;
  const color = theme.font.color.primary;

  if (!isNonEmptyString(label)) {
    return <></>;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledLink
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      color={color}
      background={background}
      backgroundHover={backgroundHover}
      backgroundActive={backgroundActive}
      border={border}
      className={className}
    >
      {label}
    </StyledLink>
  );
};
