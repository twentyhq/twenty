import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { theme } from '@ui/theme';
import { type MouseEvent } from 'react';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

const StyledLink = styled.a`
  align-items: center;
  background-color: ${theme.background.transparent.lighter};
  border: 1px solid ${theme.border.color.strong};
  border-radius: 50px;
  color: ${theme.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-weight: ${theme.font.size.md};
  gap: ${theme.spacing[1]};
  height: 10px;
  justify-content: center;
  max-width: calc(100% - ${theme.spacingMultiplicator} * 2px);
  min-width: fit-content;
  overflow: hidden;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.background.transparent.light};
  }

  &:active {
    background-color: ${theme.background.transparent.medium};
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
