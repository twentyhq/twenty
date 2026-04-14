'use client';

import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { LinkButton } from '@/design-system/components';
import type { FooterCtaType } from '@/sections/Footer/types';

type FooterNavCtaProps = {
  cta: FooterCtaType;
};

export function FooterNavCta({ cta }: FooterNavCtaProps) {
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
      label={cta.label}
      type="anchor"
      variant={cta.variant}
    />
  );
}
