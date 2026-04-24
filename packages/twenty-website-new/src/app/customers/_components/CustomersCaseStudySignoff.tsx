import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Signoff } from '@/sections/Signoff/components';
import { theme } from '@/theme';

const SIGNOFF_HEADING = [
  { text: 'Ready to grow\nwith ', fontFamily: 'serif' as const },
  { text: 'Twenty?', fontFamily: 'sans' as const },
];

const SIGNOFF_BODY = {
  text: 'Join the teams that chose to own their CRM.\nStart building with Twenty today.',
};

export function CustomersCaseStudySignoff() {
  return (
    <Signoff.Root
      backgroundColor={theme.colors.secondary.background[5]}
      color={theme.colors.primary.text[100]}
      page={Pages.Partners}
    >
      <Signoff.Heading page={Pages.Partners} segments={SIGNOFF_HEADING} />
      <Signoff.Body body={SIGNOFF_BODY} page={Pages.Partners} />
      <Signoff.Cta>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label="Get started"
          type="anchor"
          variant="contained"
        />
        <TalkToUsButton
          color="secondary"
          label="Talk to us"
          variant="outlined"
        />
      </Signoff.Cta>
    </Signoff.Root>
  );
}
