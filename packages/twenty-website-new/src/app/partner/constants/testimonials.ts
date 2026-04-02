import type { TestimonialsDataType } from '@/sections/Testimonials/types';

export const TESTIMONIALS_DATA: TestimonialsDataType = {
  eyebrow: {
    heading: { text: 'Join our growing partner ecosystem', fontFamily: 'sans' },
  },
  testimonials: [
    {
      heading: {
        text: 'Our clients ask for a CRM they can trust and shape. Twenty gives us a credible stack to implement fast, without hiding the data model behind opaque APIs.',
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/partner/testimonials/avatar-four.png',
          alt: '',
        },
        name: { text: 'Elena Vasquez' },
        handle: { text: '@elena_integrations' },
        date: new Date('2024-04-18'),
      },
    },
    {
      heading: {
        text: 'Partnering around an open codebase changed how we scope projects. We ship integrations with clear ownership and fewer surprises at go-live.',
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/partner/testimonials/avatar-five.png',
          alt: '',
        },
        name: { text: 'Jordan Okonkwo' },
        handle: { text: '@jordan_solutions' },
        date: new Date('2024-06-27'),
      },
    },
    {
      heading: {
        text: 'We needed something modern for mid-market teams that outgrow spreadsheets but dread enterprise lock-in. Twenty hits that gap for the customers we serve.',
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/partner/testimonials/avatar-two.png',
          alt: '',
        },
        name: { text: 'Samira Haddad' },
        handle: { text: '@samira_revenue' },
        date: new Date('2024-08-14'),
      },
    },
  ],
  illustration: {
    src: 'https://app.endlesstools.io/embed/48586814-c307-4abd-8eec-0270ef3e91ce',
    title: 'Endless Tools Editor',
  },
};
