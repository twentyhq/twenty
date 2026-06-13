import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  FONT_WEIGHT,
  fontFamily,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

// A labelled wrapper around a control. Per-field errors surface as the control's
// own invalid state (a red border) plus the wizard's footer banner, so the
// field itself carries no inline error text — only an optional label and hint.
const FieldRoot = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Label = styled.span`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const Hint = styled.span`
  ${typeRampDeclarations('bodyXs')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
`;

export function Field({
  children,
  hint,
  label,
}: {
  children: ReactNode;
  hint?: string;
  label?: string;
}) {
  return (
    <FieldRoot>
      {label !== undefined ? <Label>{label}</Label> : null}
      {hint !== undefined ? <Hint>{hint}</Hint> : null}
      {children}
    </FieldRoot>
  );
}
