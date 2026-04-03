import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';

export const CONTRIBUTORS_HERO_HEADING: HeadingType[] = [
  { fontFamily: 'sans', text: 'Our amazing ' },
  { fontFamily: 'serif', text: 'contributors' },
];

export const CONTRIBUTORS_HERO_BODY: BodyType = {
  text: 'Everyone here is a public contributor on github.com/twentyhq/twenty. Rankings follow the GitHub contributor list (commits to the default branch). Thank you for helping build open source CRM.',
};
