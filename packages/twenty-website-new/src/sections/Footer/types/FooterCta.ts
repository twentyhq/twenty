export type FooterCtaType =
  | {
      color: 'secondary';
      href: string;
      kind: 'link';
      label: string;
      variant: 'contained' | 'outlined';
    }
  | {
      color: 'secondary';
      kind: 'contactModal';
      label: string;
      variant: 'contained' | 'outlined';
    };
