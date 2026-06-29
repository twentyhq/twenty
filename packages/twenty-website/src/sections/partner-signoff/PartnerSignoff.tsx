import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from '@/partner-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Button, Signoff } from '@/ui';

export function PartnerSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`Join our partner ecosystem and help businesses take control of their CRM.`,
      )}
      heading={i18n._(msg`Ready to grow\n*with Twenty?*`)}
      scheme="light"
    >
      <BecomePartnerButton label={msg`Become a partner`} variant="outlined" />
      <Button href="/partners/list" label={i18n._(msg`Find a partner`)} />
    </Signoff>
  );
}
