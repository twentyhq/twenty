import type { LocalizableText } from '@/lib/i18n/localizable-text';

export type MenuNavChildIcon = 'book' | 'code' | 'tag' | 'users';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
  title: LocalizableText;
  description: LocalizableText;
};

export type MenuNavChildItemType = {
  description?: LocalizableText;
  external?: boolean;
  href: string;
  icon?: MenuNavChildIcon;
  label: LocalizableText;
  preview?: MenuNavChildPreview;
};

export type MenuNavItemType = {
  children?: MenuNavChildItemType[];
  href?: string;
  label: LocalizableText;
};
