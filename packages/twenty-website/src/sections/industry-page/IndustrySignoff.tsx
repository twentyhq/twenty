import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { Button, Signoff } from '@/ui';

export function IndustrySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`Start from an empty workspace, or with a partner who has built one before.`,
      )}
      heading={i18n._(msg`Build the CRM *your business runs on*`)}
      scheme="light"
    >
      <Button href={SITE_URLS.appWelcome} label={i18n._(msg`Start building`)} />
      <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
    </Signoff>
  );
}
