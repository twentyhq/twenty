import { msg } from '@lingui/core/macro';
import { TalkToUsButton } from '@/sections/ContactCal';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { Pages } from '@/lib/pages';
import { Signoff } from '@/sections/Signoff';

export function CustomersCaseStudySignoff() {
  const i18n = getServerI18n();
  return (
    <Signoff.Root scheme="muted" page={Pages.Partners}>
      <Signoff.Heading page={Pages.Partners}>
        <HeadingPart fontFamily="serif">
          {i18n._(msg`Ready to grow\nwith Twenty?`)}
        </HeadingPart>
      </Signoff.Heading>
      <Signoff.Body page={Pages.Partners}>
        {i18n._(
          msg`Join the teams that chose to own their CRM.\nStart building with Twenty today.`,
        )}
      </Signoff.Body>
      <Signoff.Cta>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label={i18n._(msg`Get started`)}
          variant="contained"
        />
        <TalkToUsButton
          color="secondary"
          label={msg`Talk to us`}
          variant="outlined"
        />
      </Signoff.Cta>
    </Signoff.Root>
  );
}
