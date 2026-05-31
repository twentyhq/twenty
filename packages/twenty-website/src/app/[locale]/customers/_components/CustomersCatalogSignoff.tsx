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

export function CustomersCatalogSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="light"
      centered
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">Ready to build</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">your own story?</HeadingPart>
        </Trans>
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
