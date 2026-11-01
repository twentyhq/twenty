import { type useRender } from '@base-ui/react/use-render';
import { type Ref } from 'react';

export type BreadcrumbItem = Omit<
  useRender.ComponentProps<
    'a',
    Record<string, never>,
    useRender.ElementProps<'a'>
  >,
  'ref'
> & {
  ref?: Ref<HTMLAnchorElement | HTMLSpanElement>;
};
