import type { MessageDescriptor } from '@lingui/core';

import type { ImageType } from '@/design-system/components/Image';

export type TabType = {
  body: MessageDescriptor;
  icon: string;
  image: ImageType;
};
