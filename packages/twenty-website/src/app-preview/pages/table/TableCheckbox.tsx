import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { type ReactNode } from 'react';

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
    $checked ? THEME_LIGHT.background.transparent.blue : 'transparent'};
  border: 1px solid
    ${({ $checked }) =>
      $checked
        ? THEME_LIGHT.border.color.blue
        : THEME_LIGHT.font.color.primary};
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
