import { type useRender } from '@base-ui/react/use-render';
import { type ComponentPropsWithRef, type ReactNode } from 'react';

import { type ToastVariant } from './ToastVariant';

export type ToastProps = ComponentPropsWithRef<'div'> & {
  /**
   * Replaces the rendered element or composes it with another component.
   * Accepts a React element or a function that returns the element to render.
   */
  render?: useRender.RenderProp;
  /** Visual variant that selects the icon and colors. */
  variant?: ToastVariant;
  /** Supporting content rendered below the message. */
  description?: ReactNode;
  /** Replaces the variant's icon. */
  icon?: ReactNode;
  /**
   * Accessible name of the default icon. Without it, the icon is hidden from
   * assistive technology.
   */
  iconLabel?: string;
  /** Content rendered in the footer, such as an action button. */
  action?: ReactNode;
  /**
   * Completion percentage shown in the progress bar. When set, the countdown
   * is disabled.
   */
  progress?: number;
  /**
   * Milliseconds before `onClose` is called. The countdown pauses while the
   * pointer is over the toast.
   */
  duration?: number;
  /**
   * Called when the cancel button is clicked. The button renders only when
   * this callback is provided.
   */
  onCancel?: () => void;
  /**
   * Called when the close button is clicked or the countdown completes. The
   * button renders only when this callback is provided.
   */
  onClose?: () => void;
  /** Label of the cancel button. */
  cancelLabel?: string;
  /** Accessible name of the close button. */
  closeLabel?: string;
};
