import { type useRender } from '@base-ui/react/use-render';

export type BreadcrumbItem = Pick<
  useRender.ComponentProps<'a'>,
  'children' | 'href' | 'render' | 'title'
>;
