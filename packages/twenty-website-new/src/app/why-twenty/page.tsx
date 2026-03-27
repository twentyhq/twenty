import { HERO_DATA } from '@/app/why-twenty/constants/hero';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { theme } from '@/theme';

export default function WhyTwentyPage() {
  return (
    <Hero.Root backgroundColor={theme.colors.secondary.background[100]}>
      <Hero.Heading page={Pages.WhyTwenty} segments={HERO_DATA.heading} size="xl" />
      <Hero.Body page={Pages.WhyTwenty} body={HERO_DATA.body} />
      <Hero.WhyTwentyVisual />
    </Hero.Root>
  );
}
