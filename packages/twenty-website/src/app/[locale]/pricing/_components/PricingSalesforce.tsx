import { msg } from '@lingui/core/macro';

import { SALESFORCE_DATA } from '@/app/[locale]/pricing/salesforce.data';
import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Salesforce } from '@/sections/Salesforce';

export function PricingSalesforce() {
  const i18n = getServerI18n();

  return (
    <Salesforce
      scheme="muted"
      body={SALESFORCE_DATA.body}
      pricing={SALESFORCE_DATA.pricing}
    >
      <HeadingPart fontFamily="serif">
        {i18n._(msg`Trust the n°1 CRM,`)}
      </HeadingPart>{' '}
      <HeadingPart fontFamily="sans">{i18n._(msg`or not !`)}</HeadingPart>
    </Salesforce>
  );
}
