import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from '@ui/theme';
import { type MouseEvent } from 'react';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

const StyledLink = styled.a`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 50px;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-weight: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: 10px;
  justify-content: center;
  max-width: calc(100% - ${themeCssVariables.spacingMultiplicator} * 2px);
  min-width: fit-content;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }

  &:active {
    background-color: ${themeCssVariables.background.transparent.medium};
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
