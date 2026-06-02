import { HeadingPart } from '@/design-system/components';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';

// Articles is English-only (SOURCE_LOCALE-gated), so the copy is literal.
export function ArticlesHero() {
  return (
    <HeroSection scheme="muted">
      <HeroHeading>
        <HeadingPart fontFamily="serif">Ideas on</HeadingPart>
        <br />
        <HeadingPart fontFamily="serif">open-source</HeadingPart>
        <HeadingPart fontFamily="sans">CRM</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={550}>
        Ideas from the team building Twenty on open source CRM, GTM systems, and
        building software that lasts.
      </HeroBody>
    </HeroSection>
  );
}
