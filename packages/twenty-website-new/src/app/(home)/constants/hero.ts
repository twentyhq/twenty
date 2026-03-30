import { HeroHomeDataType } from '@/sections/Hero/types';

export const HERO_DATA: HeroHomeDataType = {
  heading: [
    { text: 'Build', fontFamily: 'sans' },
    { text: ' your Enterprise CRM ', fontFamily: 'serif' },
    { text: 'at AI Speed', fontFamily: 'sans' },
  ],
  body: {
    text: 'Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves.',
  },
  background: {
    src: '/images/home/hero/background.png',
    alt: '',
  },
  foreground: {
    src: '/images/home/hero/foreground.png',
    alt: '',
  },
};
