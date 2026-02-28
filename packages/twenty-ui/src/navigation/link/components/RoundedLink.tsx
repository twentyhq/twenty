import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeVar } from '@ui/theme';
import { type MouseEvent } from 'react';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

const StyledLink = styled.a`
  align-items: center;
  background-color: ${themeVar.background.transparent.lighter};
  border: 1px solid ${themeVar.border.color.strong};
  border-radius: 50px;
  color: ${themeVar.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-weight: ${themeVar.font.size.md};
  gap: ${themeVar.spacing[1]};
  height: 10px;
  justify-content: center;
  max-width: calc(100% - ${themeVar.spacingMultiplicator} * 2px);
  min-width: fit-content;
  overflow: hidden;
  padding: ${themeVar.spacing[1]} ${themeVar.spacing[2]};
  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${themeVar.background.transparent.light};
  }

  &:active {
    background-color: ${themeVar.background.transparent.medium};
  }
`;

export const RoundedLink = ({
  label,
  href,
  onClick,
  className,
}: RoundedLinkProps) => {
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
      className={className}
    >
      {label}
    </StyledLink>
  );
};
