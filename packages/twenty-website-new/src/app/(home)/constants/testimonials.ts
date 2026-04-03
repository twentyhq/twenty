import type { TestimonialsDataType } from '@/sections/Testimonials/types';

export const TESTIMONIALS_DATA: TestimonialsDataType = {
  eyebrow: {
    heading: { text: 'They are the real sales', fontFamily: 'sans' },
  },
  testimonials: [
    {
      heading: {
        text: "YES @twentycrm has json object fields. Such a simple feature and yet so many CRMs don't. It allows me to add data without caring too much about the data model, and eventually make it cleaner if the model gets stable.",
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/home/testimonials/avatar-one.png',
          alt: '',
        },
        name: { text: 'Wayne Hamadi' },
        handle: { text: '@wayne_hamadi' },
        date: new Date('2024-05-23'),
      },
    },
    {
      heading: {
        text: 'We switched from a rigid CRM where every custom field felt like a ticket. Twenty lets our team model how we actually sell without waiting on consultants.',
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/home/testimonials/avatar-two.png',
          alt: '',
        },
        name: { text: 'Priya Nandakumar' },
        handle: { text: '@priya_builds' },
        date: new Date('2024-07-11'),
      },
    },
    {
      heading: {
        text: 'Open source was the hook; the product is what kept us. Pipelines, people, and reporting finally live in one place our engineers are happy to extend.',
        fontFamily: 'sans',
      },
      author: {
        avatar: {
          src: '/images/home/testimonials/avatar-three.png',
          alt: '',
        },
        name: { text: 'Marcus Chen' },
        handle: { text: '@marcus_ops' },
        date: new Date('2024-09-02'),
      },
    },
  ],
  illustration: {
    src: 'https://app.endlesstools.io/embed/61c7255f-cf10-46f6-ac99-91047fd76d75',
    title: 'Endless Tools Editor',
  },
};
