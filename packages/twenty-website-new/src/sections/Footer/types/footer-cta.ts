import type { MessageDescriptor } from '@lingui/core';

export type FooterCtaType =
  | {
      color: 'secondary';
      href: string;
      kind: 'link';
      label: MessageDescriptor;
      variant: 'contained' | 'outlined';
    }
  | {
      color: 'secondary';
      kind: 'contactModal';
      label: MessageDescriptor;
      variant: 'contained' | 'outlined';
    };
