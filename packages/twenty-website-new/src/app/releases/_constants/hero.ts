import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';

export const RELEASE_NOTES_HERO_HEADING: HeadingType[] = [
  { fontFamily: 'serif', text: 'Latest ' },
  { fontFamily: 'sans', text: 'Releases', newLine: true },
];

export const RELEASE_NOTES_HERO_BODY: BodyType = {
  text: 'Discover the newest features and improvements in Twenty,\nthe #1 open-source CRM.',
};
