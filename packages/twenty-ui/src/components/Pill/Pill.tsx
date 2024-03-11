import * as React from 'react';
import styled from '@emotion/styled';

type PillProps = {
  className?: string;
  label?: string;
};

const StyledPill = styled.span`
  align-items: center;
  background: #0000000a;
  border-radius: 999px;
  color: #b3b3b3;
  display: inline-block;
  font-size: 0.85rem;
  font-style: normal;
  font-weight: 500;
  gap: 8px;
  height: 16px;
  justify-content: flex-end;
  line-height: 1.5;
  padding: 0 8px;
`;

export const Pill = ({ className, label }: PillProps) => (
  <StyledPill className={className}>{label}</StyledPill>
);
