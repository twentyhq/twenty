import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Button, EngagementBand } from '@/ui';

export function PricingEngagementBand() {
  const i18n = getServerI18n();

  return (
    <EngagementBand
      heading={i18n._(msg`Need help with customization?`)}
      body={i18n._(
        msg`Find the right partner to implement, customize, and tailor Twenty to your team.`,
      )}
      actions={
        <Button href="/partners/list" label={i18n._(msg`Browse partners`)} />
      }
    />
  );
}
