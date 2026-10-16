import { type ReactNode } from 'react';

import { Text } from '@ui/primitives/typography';
import { themeCssVariables } from '@ui/theme';

type IconButtonExampleProps = {
  children: ReactNode;
  label: string;
};

export const IconButtonExample = ({
  children,
  label,
}: IconButtonExampleProps) => (
  <Text
    style={{ display: 'grid', gap: 8, justifyItems: 'center', minWidth: 64 }}
  >
    <Text
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
      }}
    >
      {children}
    </Text>
    <Text
      render={<span />}
      style={{ color: themeCssVariables.font.color.secondary, fontSize: 12 }}
    >
      {label}
    </Text>
  </Text>
);
