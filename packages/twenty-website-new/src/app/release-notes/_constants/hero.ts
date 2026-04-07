import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';

export const RELEASE_NOTES_HERO_HEADING: HeadingType[] = [
  { fontFamily: 'sans', text: 'Release ' },
  { fontFamily: 'serif', text: 'notes' },
];

export const RELEASE_NOTES_HERO_BODY: BodyType = {
  text: 'New features, fixes, and improvements across Twenty. Notes are maintained alongside the main marketing site content.',
};
