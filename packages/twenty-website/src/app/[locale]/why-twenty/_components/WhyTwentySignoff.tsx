import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { HeadingPart, LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Signoff } from '@/templates/Signoff';

export function WhyTwentySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="dark"
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">
            Build a CRM your competitors
          </HeadingPart>
          <HeadingPart fontFamily="sans">can't buy.</HeadingPart>
        </Trans>
      }
      body={<Trans>Open-source, AI-ready, and yours to shape.</Trans>}
    >
      <LinkButton
        color="primary"
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Get started`)}
        variant="contained"
      />
    </Signoff>
  );
}
