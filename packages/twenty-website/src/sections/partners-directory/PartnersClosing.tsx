import { msg } from '@lingui/core/macro';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Signoff } from '@/ui';

type PartnersClosingProps = {
  action: ReactNode;
};

export function PartnersClosing({ action }: PartnersClosingProps) {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
      )}
      heading={i18n._(msg`Didn't find the *right partner*?`)}
      scheme="muted"
    >
      {action}
    </Signoff>
  );
}
