import type { TestimonialsDataType } from '@/sections/Testimonials/types';

export const TESTIMONIALS_DATA: TestimonialsDataType = {
  eyebrow: {
    heading: { text: 'Join our growing partner ecosystem', fontFamily: 'sans' },
  },
  testimonials: [
    {
      heading: {
        text: "Twenty gives you the kind of flexibility that actually changes what you can offer your clients. The dev experience is clean, the APIs are open, and when something needs to be customized, you can just do it. There's no fighting the platform.",
        fontFamily: 'sans',
      },
      author: {
        name: { text: 'Benjamin Reynolds' },
        designation: { text: 'Principal and Founder, Alternative Partners' },
        avatar: {
          src: '/images/partner/testimonials/benjamin-reynolds.webp',
          alt: 'Portrait of Benjamin Reynolds',
        },
      },
    },
    {
      heading: {
        text: "The flexibility is just amazing. Literally, there's nothing you cannot do. You can create objects, access everything through the API, pull notes and send them to the portal. Try doing that in HubSpot. No way. It's the true ability to build exactly what's actually needed.",
        fontFamily: 'sans',
      },
      author: {
        name: { text: 'Bertrams' },
        designation: { text: 'Founder, Wintactix' },
        avatar: {
          src: '/images/partner/testimonials/bertrams.jpeg',
          alt: 'Portrait of Bertrams',
        },
      },
    },
    {
      heading: {
        text: "Twenty Apps opens the door to building products, not just implementations. For example, we're developing a WhatsApp Business integration that any Twenty’s client could get. That's a recurring revenue stream we wouldn't have if we were just configuring someone else's platform.",
        fontFamily: 'sans',
      },
      author: {
        name: { text: 'Mike Babiy' },
        designation: { text: 'Founder, Nine Dots Ventures' },
        avatar: {
          src: '/images/partner/testimonials/mike-babiy.png',
          alt: 'Photo featuring Mike Babiy',
        },
      },
    },
  ],
};
