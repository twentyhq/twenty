import { type useRender } from '@base-ui/react/use-render';

import { type BreadcrumbItem } from './BreadcrumbItem';

export type BreadcrumbProps = Omit<
  useRender.ComponentProps<'nav'>,
  'children'
> & {
  links: BreadcrumbItem[];
};
