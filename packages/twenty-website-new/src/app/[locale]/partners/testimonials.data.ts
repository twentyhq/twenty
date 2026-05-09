import { msg } from '@lingui/core/macro';
import type { TestimonialCardType } from '@/sections/Testimonials';

export const PARTNER_TESTIMONIALS: TestimonialCardType[] = [
  {
    heading: msg`Twenty gives you the kind of flexibility that actually changes what you can offer your clients. The dev experience is clean, the APIs are open, and when something needs to be customized, you can just do it. There's no fighting the platform.`,
    author: {
      name: msg`Benjamin Reynolds`,
      designation: msg`Principal and Founder, Alternative Partners`,
      avatar: {
        src: '/images/partner/testimonials/benjamin-reynolds.webp',
        alt: 'Portrait of Benjamin Reynolds',
      },
    },
  },
  {
    heading: msg`The flexibility is just amazing. Literally, there's nothing you cannot do. You can create objects, access everything through the API, pull notes and send them to the portal. Try doing that in HubSpot. No way. It's the true ability to build exactly what's actually needed.`,
    author: {
      name: msg`Bertrams`,
      designation: msg`Founder, Wintactix`,
      avatar: {
        src: '/images/partner/testimonials/bertrams.webp',
        alt: 'Portrait of Bertrams',
      },
    },
  },
  {
    heading: msg`Twenty Apps opens the door to building products, not just implementations. For example, we're developing a WhatsApp Business integration that any Twenty's client could get. That's a recurring revenue stream we wouldn't have if we were just configuring someone else's platform.`,
    author: {
      name: msg`Mike Babiy`,
      designation: msg`Founder, Nine Dots Ventures`,
      avatar: {
        src: '/images/partner/testimonials/mike-babiy.webp',
        alt: 'Photo featuring Mike Babiy',
      },
    },
  },
];
