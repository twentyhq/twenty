import { Eyebrow as BaseEyebrow } from '@/design-system/components';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';

type EditorialEyebrowProps = {
  colorScheme: 'primary' | 'secondary';
  eyebrow: MessageEyebrow;
  renderText: (descriptor: MessageDescriptor) => ReactNode;
};

export function Eyebrow({
  colorScheme,
  eyebrow,
  renderText,
}: EditorialEyebrowProps) {
  return (
    <BaseEyebrow
      colorScheme={colorScheme}
      heading={eyebrow.heading}
      renderText={renderText}
    />
  );
}
