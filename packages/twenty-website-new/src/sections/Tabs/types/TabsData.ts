import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { TabType } from '@/sections/Tabs/types/Tab';

export type TabsDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  body: BodyType;
  tabs: TabType[];
};
