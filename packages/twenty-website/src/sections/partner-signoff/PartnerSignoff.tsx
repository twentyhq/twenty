import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from '@/partner-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Signoff } from '@/ui';

export function PartnerSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`We certify real builders only. Every application is reviewed against a shipped Twenty project — send yours with proof.`,
      )}
      heading={i18n._(msg`Ready to grow *with Twenty?*`)}
      scheme="light"
    >
      <BecomePartnerButton label={msg`Become a partner`} />
    </Signoff>
  );
}
