import { FAQ_DATA } from '@/app/(home)/constants/faq';
import { ENGAGEMENT_BAND_DATA } from '@/app/partner/constants/engagement-band';
import { HERO_DATA } from '@/app/pricing/constants/hero';
import { Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { EngagementBand } from '@/sections/EngagementBand/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Plans } from '@/sections/Plans/components';
import { theme } from '@/theme';

export default function PricingPage() {
  return (
    <>
      <Hero.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Hero.Heading page={Pages.Pricing} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Pricing} body={HERO_DATA.body} />
      </Hero.Root>

      <Plans.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Plans.Content />
      </Plans.Root>

      <EngagementBand.Root
        backgroundColor={theme.colors.secondary.background[5]}
      >
        <EngagementBand.Strip
          fillColor={theme.colors.primary.background[100]}
          variant="primary"
        >
          <EngagementBand.Copy>
            <EngagementBand.Heading segments={ENGAGEMENT_BAND_DATA.heading} />
            <EngagementBand.Body body={ENGAGEMENT_BAND_DATA.body} />
          </EngagementBand.Copy>
          <EngagementBand.Actions>
            <LinkButton
              color="secondary"
              href="https://app.twenty.com/welcome"
              label="Read our case studies"
              type="anchor"
              variant="contained"
            />
          </EngagementBand.Actions>
        </EngagementBand.Strip>
      </EngagementBand.Root>

      <Faq.Root illustration={FAQ_DATA.illustration}>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary" heading={FAQ_DATA.eyebrow.heading} />
          <Heading
            as="h2"
            segments={FAQ_DATA.heading}
            size="lg"
            weight="light"
          />
          <div
            style={{
              columnGap: theme.spacing(2),
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              justifyContent: 'start',
            }}
          >
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <LinkButton
              color="primary"
              href="https://twenty.com/contact"
              label="Talk to us"
              type="anchor"
              variant="outlined"
            />
          </div>
        </Faq.Intro>
        <Faq.Items
          items={FAQ_DATA.questions.map((faqQuestion, index) => ({
            answer: faqQuestion.answer.text,
            question: faqQuestion.question.text,
            value: `faq-${index}`,
          }))}
        />
      </Faq.Root>
    </>
  );
}
