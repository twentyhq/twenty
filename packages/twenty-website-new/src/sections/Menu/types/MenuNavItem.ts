export type MenuNavChildIcon = 'book' | 'code' | 'tag' | 'users';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
  title: string;
  description: string;
};

export type MenuNavChildItemType = {
  description?: string;
  external?: boolean;
  href: string;
  icon?: MenuNavChildIcon;
  label: string;
  preview?: MenuNavChildPreview;
};

export type MenuNavItemType = {
  children?: MenuNavChildItemType[];
  href?: string;
  label: string;
};
