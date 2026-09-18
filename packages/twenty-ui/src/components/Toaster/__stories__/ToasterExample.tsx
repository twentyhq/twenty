import { ToastProvider } from '@ui/components/Toast/ToastProvider';

import { Toaster } from '../Toaster';
import { ToastControls } from './ToastControls';
import { type ToasterExampleProps } from './ToasterExampleProps';

export const ToasterExample = ({ limit, onClose }: ToasterExampleProps) => (
  <ToastProvider limit={limit}>
    <ToastControls onClose={onClose} />
    <Toaster />
  </ToastProvider>
);
