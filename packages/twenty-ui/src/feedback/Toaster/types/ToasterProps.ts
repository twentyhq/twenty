import { type useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef } from 'react';

import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';
import { type ToastProps } from '@ui/feedback/Toast/types/ToastProps';

export type ToasterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  container?: HTMLElement | null;
  getToastProps?: (
    toast: ToastNotification,
  ) => Partial<Omit<ToastProps, 'id' | 'onClose' | 'ref'>>;
  render?: useRender.RenderProp;
};
