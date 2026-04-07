import { Eyebrow as BaseEyebrow } from '@/design-system/components';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';

type EditorialEyebrowProps = {
  colorScheme: 'primary' | 'secondary';
  eyebrow: EyebrowType;
};

export function Eyebrow({ colorScheme, eyebrow }: EditorialEyebrowProps) {
  return <BaseEyebrow colorScheme={colorScheme} heading={eyebrow.heading} />;
}
