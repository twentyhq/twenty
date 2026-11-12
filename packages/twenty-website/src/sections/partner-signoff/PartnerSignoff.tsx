import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from '@/partner-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Signoff } from '@/ui';

export function PartnerSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`We review every application by hand. Show us what you have built with Twenty and who you build it for.`,
      )}
      heading={i18n._(msg`Ready to grow *with Twenty?*`)}
      scheme="light"
    >
      <BecomePartnerButton label={msg`Apply as an integrator`} />
    </Signoff>
  );
}
