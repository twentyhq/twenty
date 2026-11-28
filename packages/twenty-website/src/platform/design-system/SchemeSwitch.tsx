'use client';

import { styled } from '@linaria/react';

import { SCHEMES, semanticColor, spacing, type Scheme } from '@/tokens';
import { Button } from '@/ui';

const Bar = styled.div`
  align-items: center;
  background: ${semanticColor.surface};
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  padding-block: ${spacing(3)};
  position: sticky;
  top: ${spacing(14)};
  z-index: 1;
`;

export function SchemeSwitch({
  scheme,
  onSchemeChange,
}: {
  scheme: Scheme;
  onSchemeChange: (scheme: Scheme) => void;
}) {
  return (
    <Bar>
      {(Object.keys(SCHEMES) as Scheme[]).map((each) => (
        <Button
          key={each}
          label={each}
          size="small"
          variant={each === scheme ? 'filled' : 'outlined'}
          onClick={() => onSchemeChange(each)}
        />
      ))}
    </Bar>
  );
}
