import { IllustrationMount } from '@/illustrations';
import { createElement } from 'react';
import { Carousel } from './Carousel/Carousel';
import { PartnerCarousel } from './PartnerCarousel/PartnerCarousel';
import { Root } from './Root/Root';
import { Separator } from './Separator/Separator';

function HomeVisual() {
  return createElement(IllustrationMount, {
    illustration: 'testimonialsHourglass',
  });
}

function PartnerVisual() {
  return createElement(IllustrationMount, {
    illustration: 'testimonialsPartner',
  });
}

export const Testimonials = {
  Carousel,
  HomeVisual,
  PartnerCarousel,
  PartnerVisual,
  Root,
  Separator,
};
