import { Trans } from '@lingui/react/macro';

import { SALESFORCE_DATA } from '@/app/[locale]/pricing/salesforce.data';
import { HeadingPart } from '@/design-system/components';
import { Salesforce } from '@/sections/Salesforce';

export function PricingSalesforce() {
  return (
    <Salesforce
      scheme="muted"
      body={SALESFORCE_DATA.body}
      pricing={SALESFORCE_DATA.pricing}
    >
      <Trans>
        <HeadingPart fontFamily="serif">Trust the n°1 CRM,</HeadingPart>
        <HeadingPart fontFamily="sans">or not!</HeadingPart>
      </Trans>
    </Salesforce>
  );
}
