import { Trans } from '@lingui/react/macro';

import { PartnerSignoffCtas } from '@/app/[locale]/partners/components/PartnerApplication';
import { HeadingPart, ResponsiveLineBreak } from '@/design-system/components';
import { Signoff } from '@/templates/Signoff';

export function PartnerSignoff() {
  return (
    <Signoff
      scheme="light"
      centered
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">Ready to grow</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">with Twenty?</HeadingPart>
        </Trans>
      }
      body={
        <Trans>
          Join our partner ecosystem and help businesses
          <ResponsiveLineBreak />
          take control of their CRM.
        </Trans>
      }
    >
      <PartnerSignoffCtas />
    </Signoff>
  );
}
