import { styled } from '@linaria/react';
import { type ComponentType, type ReactNode } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

type FieldIconComponent = ComponentType<{
  'aria-hidden'?: boolean;
  size?: number;
  stroke?: number;
}>;

const FieldRowShell = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
  width: 100%;
`;

const FieldIconBox = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FieldValueWrap = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

export function FieldRow({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon: FieldIconComponent;
}) {
  return (
    <FieldRowShell>
      <FieldIconBox>
        <Icon aria-hidden size={16} stroke={1.6} />
      </FieldIconBox>
      <FieldValueWrap>{children}</FieldValueWrap>
    </FieldRowShell>
  );
}
