import { msg } from '@lingui/core/macro';
import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';

export const RELEASE_NOTES_HERO_HEADING: HeadingType[] = [
  { fontFamily: 'serif', text: msg`Latest ` },
  { fontFamily: 'sans', text: msg`Releases`, newLine: true },
];

export const RELEASE_NOTES_HERO_BODY: BodyType = {
  text: msg`Discover the newest features and improvements in Twenty,\nthe #1 open source CRM.`,
};
