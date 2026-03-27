import { HERO_DATA } from '@/app/pricing/constants/hero';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { theme } from '@/theme';

export default function PricingPage() {
  return (
    <>
      <Hero.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Hero.Heading page={Pages.Pricing} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Pricing} body={HERO_DATA.body} />
      </Hero.Root>
    </>
  );
}
