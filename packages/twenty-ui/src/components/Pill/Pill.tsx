import { styled } from '@linaria/react';

type PillProps = {
  className?: string;
  label?: string;
};

const StyledPill = styled.span`
  align-items: center;
  background: var(--background-transparent-light);
  border-radius: var(--border-radius-pill);
  color: var(--font-color-light);
  display: inline-block;
  font-size: var(--font-size-xs);
  font-style: normal;
  font-weight: var(--font-weight-medium);
  gap: var(--spacing-2);
  height: var(--spacing-4);
  justify-content: flex-end;
  line-height: var(--text-line-height-lg);
  padding: 0 var(--spacing-2);
`;

export const Pill = ({ className, label }: PillProps) => {
  return <StyledPill className={className}>{label}</StyledPill>;
};
