import { msg } from '@lingui/core/macro';

import { HeadingPart, LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Signoff } from '@/sections/Signoff';

// Closing sign-off for the why-twenty page (dark, compact layout).
export function WhyTwentySignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="dark"
      heading={
        <>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Build a CRM your competitors`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">{i18n._(msg`can't buy.`)}</HeadingPart>
        </>
      }
      body={i18n._(msg`Open-source, AI-ready, and yours to shape.`)}
    >
      <LinkButton
        color="primary"
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Get started`)}
        variant="contained"
      />
    </Signoff>
  );
}
