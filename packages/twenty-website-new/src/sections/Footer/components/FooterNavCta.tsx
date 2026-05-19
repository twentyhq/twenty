import { TalkToUsButton } from '@/sections/ContactCal';
import { LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import type { FooterCtaType } from '@/sections/Footer/types';

type FooterNavCtaProps = {
  cta: FooterCtaType;
};

export function FooterNavCta({ cta }: FooterNavCtaProps) {
  const i18n = getServerI18n();
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
      label={i18n._(cta.label)}
      variant={cta.variant}
    />
  );
}
