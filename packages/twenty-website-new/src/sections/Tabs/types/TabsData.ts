import { BodyType } from '@/design-system/components/Body/types/Body';
import { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { TabType } from '@/sections/Tabs/types/Tab';

export type TabsDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  body: BodyType;
  tabs: TabType[];
};
