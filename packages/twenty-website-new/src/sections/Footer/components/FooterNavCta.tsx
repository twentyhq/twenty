import { TalkToUsButton } from '@/lib/contact-cal';
import { LinkButton } from '@/design-system/components';
import type { FooterCtaType } from '@/sections/Footer/types';
import type { MessageDescriptor } from '@lingui/core';

type FooterNavCtaProps = {
  cta: FooterCtaType;
  renderText: (descriptor: MessageDescriptor) => string;
};

export function FooterNavCta({ cta, renderText }: FooterNavCtaProps) {
  if (cta.kind === 'contactModal') {
    return (
      <TalkToUsButton
        color={cta.color}
        label={cta.label}
        variant={cta.variant}
      />
    );
  }

  return (
    <LinkButton
      color={cta.color}
      href={cta.href}
      label={renderText(cta.label)}
      variant={cta.variant}
    />
  );
}
