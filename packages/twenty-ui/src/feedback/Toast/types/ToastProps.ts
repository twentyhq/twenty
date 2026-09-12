import { type useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef, type ReactNode } from 'react';

import { type ToastVariant } from './ToastVariant';

export type ToastProps = ComponentPropsWithRef<'div'> & {
  render?: useRender.RenderProp;
  variant?: ToastVariant;
  description?: ReactNode;
  icon?: ReactNode;
  iconLabel?: string;
  action?: ReactNode;
  progress?: number;
  duration?: number;
  onCancel?: () => void;
  onClose?: () => void;
  cancelLabel?: string;
  closeLabel?: string;
};
