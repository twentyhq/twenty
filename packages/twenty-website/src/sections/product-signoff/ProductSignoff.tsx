import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { Button, Signoff } from '@/ui';

export function ProductSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(msg`Open-source, AI-ready, and set up in minutes.`)}
      heading={i18n._(msg`Start moving *faster today.*`)}
      headingMaxWidth={500}
      scheme="light"
    >
      <Button href={SITE_URLS.appWelcome} label={i18n._(msg`Get started`)} />
      <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
    </Signoff>
  );
}
