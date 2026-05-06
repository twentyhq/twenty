import { msg } from '@lingui/core/macro';
import type { TestimonialsDataType } from '@/sections/Testimonials/types';

export const TESTIMONIALS_DATA: TestimonialsDataType = {
  eyebrow: {
    heading: {
      text: msg`Join our growing partner ecosystem`,
      fontFamily: 'sans',
    },
  },
  testimonials: [
    {
      heading: {
        text: msg`Twenty gives you the kind of flexibility that actually changes what you can offer your clients. The dev experience is clean, the APIs are open, and when something needs to be customized, you can just do it. There's no fighting the platform.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Benjamin Reynolds` },
        designation: { text: msg`Principal and Founder, Alternative Partners` },
        avatar: {
          src: '/images/partner/testimonials/benjamin-reynolds.webp',
          alt: 'Portrait of Benjamin Reynolds',
        },
      },
    },
    {
      heading: {
        text: msg`The flexibility is just amazing. Literally, there's nothing you cannot do. You can create objects, access everything through the API, pull notes and send them to the portal. Try doing that in HubSpot. No way. It's the true ability to build exactly what's actually needed.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Bertrams` },
        designation: { text: msg`Founder, Wintactix` },
        avatar: {
          src: '/images/partner/testimonials/bertrams.jpeg',
          alt: 'Portrait of Bertrams',
        },
      },
    },
    {
      heading: {
        text: msg`Twenty Apps opens the door to building products, not just implementations. For example, we're developing a WhatsApp Business integration that any Twenty’s client could get. That's a recurring revenue stream we wouldn't have if we were just configuring someone else's platform.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Mike Babiy` },
        designation: { text: msg`Founder, Nine Dots Ventures` },
        avatar: {
          src: '/images/partner/testimonials/mike-babiy.png',
          alt: 'Photo featuring Mike Babiy',
        },
      },
    },
  ],
};
