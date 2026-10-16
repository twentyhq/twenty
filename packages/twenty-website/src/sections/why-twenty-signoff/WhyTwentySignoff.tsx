import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { Button, Signoff } from '@/ui';

export function WhyTwentySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(msg`Open-source, AI-ready, and yours to shape.`)}
      crosshairSide="left"
      heading={i18n._(msg`Build a CRM your competitors *can't buy.*`)}
      scheme="dark"
    >
      <Button href={SITE_URLS.appWelcome} label={i18n._(msg`Get started`)} />
    </Signoff>
  );
}
