import { msg } from '@lingui/core/macro';

import { HeadingPart, LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { TalkToUsButton } from '@/sections/ContactCal';
import { Signoff } from '@/templates/Signoff';

// Closing sign-off for the customers catalog page.
export function CustomersCatalogSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      scheme="light"
      centered
      preLine
      heading={
        <>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Ready to build`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`your own story?`)}
          </HeadingPart>
        </>
      }
      body={i18n._(
        msg`Join the teams that chose to own their CRM.\nStart building with Twenty today.`,
      )}
    >
      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Get started`)}
        variant="contained"
      />
      <TalkToUsButton
        color="secondary"
        label={msg`Talk to us`}
        variant="outlined"
      />
    </Signoff>
  );
}
