import { IllustrationMount } from '@/illustrations';
import { PartnerVisual } from '@/sections/Hero/components/PartnerVisual/PartnerVisual';
import { WhyTwentyVisual } from '@/sections/Hero/components/WhyTwentyVisual/WhyTwentyVisual';
import { createElement } from 'react';
import { Body } from './Body/Body';
import { Cta } from './Cta/Cta';
import { Heading } from './Heading/Heading';
import { HomeVisual } from './HomeVisual/HomeVisual';
import { Root } from './Root/Root';

function ProductVisual() {
  return createElement(IllustrationMount, { illustration: 'heroProduct' });
}

function ReleaseNotesVisual() {
  return createElement(IllustrationMount, {
    illustration: 'heroReleaseNotes',
  });
}

export const Hero = {
  Root,
  Heading,
  Body,
  Cta,
  HomeVisual,
  ProductVisual,
  ReleaseNotesVisual,
  PartnerVisual,
  WhyTwentyVisual,
};
