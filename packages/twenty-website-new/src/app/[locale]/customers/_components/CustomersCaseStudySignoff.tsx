import { msg } from '@lingui/core/macro';
import { TalkToUsButton } from '@/lib/contact-cal';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { Pages } from '@/lib/pages';
import { Signoff } from '@/sections/Signoff/components';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';

const SIGNOFF_BODY = {
  text: msg`Join the teams that chose to own their CRM.\nStart building with Twenty today.`,
};

type CustomersCaseStudySignoffProps = {
  renderText: (descriptor: MessageDescriptor) => string;
};

export function CustomersCaseStudySignoff({
  renderText,
}: CustomersCaseStudySignoffProps) {
  return (
    <Signoff.Root
      backgroundColor={theme.colors.secondary.background[5]}
      color={theme.colors.primary.text[100]}
      page={Pages.Partners}
    >
      <Signoff.Heading page={Pages.Partners}>
        <HeadingPart fontFamily="serif">
          {renderText(msg`Ready to grow\nwith Twenty?`)}
        </HeadingPart>
      </Signoff.Heading>
      <Signoff.Body
        body={SIGNOFF_BODY}
        page={Pages.Partners}
        renderText={renderText}
      />
      <Signoff.Cta>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label={renderText(msg`Get started`)}
          variant="contained"
        />
        <TalkToUsButton
          color="secondary"
          label={msg`Talk to us`}
          variant="outlined"
        />
      </Signoff.Cta>
    </Signoff.Root>
  );
}
