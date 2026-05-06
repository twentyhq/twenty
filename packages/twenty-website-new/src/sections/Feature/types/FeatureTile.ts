import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { ImageType } from '@/design-system/components/Image';

export type FeatureTileType = {
  bullets: MessageBody[];
  heading: MessageHeadingSegment;
  icon: string;
  image: ImageType;
};
