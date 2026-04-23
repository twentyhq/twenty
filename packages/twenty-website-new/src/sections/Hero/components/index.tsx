import { WebGlMount } from '@/lib/visual-runtime';
import { Product } from '@/sections/Hero/visuals/Product';
import { ReleaseNotes } from '@/sections/Hero/visuals/ReleaseNotes';
import { PartnerVisual } from '@/sections/Hero/components/PartnerVisual/PartnerVisual';
import { WhyTwentyVisual } from '@/sections/Hero/components/WhyTwentyVisual';
import { Body } from './Body';
import { Cta } from './Cta';
import { Heading } from './Heading';
import { HomeVisual } from './HomeVisual/HomeVisual';
import { Root } from './Root';

function ProductVisual() {
  return (
    <WebGlMount priority>
      <Product />
    </WebGlMount>
  );
}

function ReleaseNotesVisual() {
  return (
    <WebGlMount priority>
      <ReleaseNotes />
    </WebGlMount>
  );
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
