import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';

import { Toaster } from '../Toaster';
import { ToastUpdateControls } from './ToastUpdateControls';
import { type ToasterUpdateExampleProps } from './ToasterUpdateExampleProps';

export const ToasterUpdateExample = (props: ToasterUpdateExampleProps) => (
  <ToastProvider>
    <ToastUpdateControls {...props} />
    <Toaster />
  </ToastProvider>
);
