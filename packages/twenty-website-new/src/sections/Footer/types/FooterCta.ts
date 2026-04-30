import type { LocalizableText } from '@/lib/i18n/localizable-text';

export type FooterCtaType =
  | {
      color: 'secondary';
      href: string;
      kind: 'link';
      label: LocalizableText;
      variant: 'contained' | 'outlined';
    }
  | {
      color: 'secondary';
      kind: 'contactModal';
      label: LocalizableText;
      variant: 'contained' | 'outlined';
    };
