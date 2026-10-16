import { type ReactNode } from 'react';

import { Text } from '@ui/primitives/typography';

type RadioCardContentProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export const RadioCardContent = ({
  icon,
  title,
  description,
}: RadioCardContentProps) => (
  <span style={{ display: 'grid', gap: 8, paddingInlineEnd: 24 }}>
    {icon}
    <Text
      render={<span />}
      style={{ fontWeight: 'var(--t-font-weight-medium)' }}
    >
      {title}
    </Text>
    <Text
      render={<span />}
      style={{ color: 'var(--t-font-color-secondary)', lineHeight: 1.5 }}
    >
      {description}
    </Text>
  </span>
);
