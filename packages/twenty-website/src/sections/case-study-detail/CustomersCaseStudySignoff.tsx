import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Button, Signoff } from '@/ui';

export function CustomersCaseStudySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`Join the teams that chose to own their CRM. Start building with Twenty today.`,
      )}
      heading={i18n._(msg`Ready to grow *with Twenty?*`)}
      scheme="muted"
    >
      <Button
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Get started`)}
      />
      <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
    </Signoff>
  );
}
