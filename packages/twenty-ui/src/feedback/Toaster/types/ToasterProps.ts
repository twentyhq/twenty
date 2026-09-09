import { type useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef } from 'react';

export type ToasterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  container?: HTMLElement | null;
  render?: useRender.RenderProp;
};
