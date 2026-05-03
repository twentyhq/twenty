import { Eyebrow as BaseEyebrow } from '@/design-system/components';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';

type EditorialEyebrowProps = {
  colorScheme: 'primary' | 'secondary';
  eyebrow: MessageEyebrow;
};

export function Eyebrow({ colorScheme, eyebrow }: EditorialEyebrowProps) {
  return (
    <BaseEyebrow
      colorScheme={colorScheme}
      heading={eyebrow.heading}
      renderText={renderMessageDescriptor}
    />
  );
}
