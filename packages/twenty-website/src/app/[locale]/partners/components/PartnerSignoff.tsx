import { msg } from '@lingui/core/macro';

import { PartnerSignoffCtas } from '@/app/[locale]/partners/components/PartnerApplication';
import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Signoff } from '@/templates/Signoff';

// Closing sign-off for the partners page.
export function PartnerSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="light"
      centered
      preLine
      heading={
        <>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Ready to grow`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`with Twenty?`)}
          </HeadingPart>
        </>
      }
      body={i18n._(
        msg`Join our partner ecosystem and help businesses\ntake control of their CRM.`,
      )}
    >
      <PartnerSignoffCtas />
    </Signoff>
  );
}
