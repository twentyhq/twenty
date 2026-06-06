import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import {
  HeadingPart,
  LinkButton,
  ResponsiveLineBreak,
} from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { TalkToUsButton } from '@/sections/ContactCal';
import { Signoff } from '@/templates/Signoff';

export function CustomersCaseStudySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="muted"
      centered
      heading={
        <HeadingPart fontFamily="serif">
          <Trans>
            Ready to grow
            <ResponsiveLineBreak />
            with Twenty?
          </Trans>
        </HeadingPart>
      }
      body={
        <Trans>
          Join the teams that chose to own their CRM.
          <ResponsiveLineBreak />
          Start building with Twenty today.
        </Trans>
      }
    >
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
    </Signoff>
  );
}
