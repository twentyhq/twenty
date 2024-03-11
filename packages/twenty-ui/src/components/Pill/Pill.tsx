import * as React from 'react';
import styled from '@emotion/styled';

type PillProps = {
  className?: string;
  label?: string;
};

const StyledPill = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.font.color.light};
  display: inline-block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: flex-end;
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  padding: ${({ theme }) => `0 ${theme.spacing(2)}`};
`;

export const Pill = ({ className, label }: PillProps) => {
  return <StyledPill className={className}>{label}</StyledPill>;
};
