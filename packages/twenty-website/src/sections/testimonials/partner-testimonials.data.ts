import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// The partner testimonials carry an author portrait, unlike the home set.
export type PartnerTestimonialRecord = {
  author: {
    designation: MessageDescriptor;
    name: MessageDescriptor;
    portraitSrc: string;
  };
  quote: MessageDescriptor;
};

export const PARTNER_TESTIMONIALS: readonly PartnerTestimonialRecord[] = [
  {
    quote: msg`Twenty gives you the kind of flexibility that actually changes what you can offer your clients. The dev experience is clean, the APIs are open, and when something needs to be customized, you can just do it. There's no fighting the platform.`,
    author: {
      name: msg`Benjamin Reynolds`,
      designation: msg`Principal and Founder, Alternative Partners`,
      portraitSrc: '/images/partners/testimonials/benjamin-reynolds.webp',
    },
  },
  {
    quote: msg`The flexibility is just amazing. Literally, there's nothing you cannot do. You can create objects, access everything through the API, pull notes and send them to the portal. Try doing that in HubSpot. No way. It's the true ability to build exactly what's actually needed.`,
    author: {
      name: msg`Bertrams`,
      designation: msg`Founder, Wintactix`,
      portraitSrc: '/images/partners/testimonials/bertrams.webp',
    },
  },
  {
    quote: msg`Twenty Apps opens the door to building products, not just implementations. For example, we're developing a WhatsApp Business integration that any Twenty's client could get. That's a recurring revenue stream we wouldn't have if we were just configuring someone else's platform.`,
    author: {
      name: msg`Mike Babiy`,
      designation: msg`Founder, Nine Dots Ventures`,
      portraitSrc: '/images/partners/testimonials/mike-babiy.webp',
    },
  },
];
