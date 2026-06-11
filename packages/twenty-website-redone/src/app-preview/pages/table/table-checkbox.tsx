import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { PREVIEW_COLORS } from '../../preview-colors';

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked ? PREVIEW_COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) =>
      $checked ? PREVIEW_COLORS.accentBorder : PREVIEW_COLORS.text};
  border-radius: 3px;
  display: flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export function TableCheckbox({
  checked,
  children,
}: {
  checked?: boolean;
  children?: ReactNode;
}) {
  return (
    <CheckboxContainer>
      <CheckboxBox $checked={checked}>{children}</CheckboxBox>
    </CheckboxContainer>
  );
}
