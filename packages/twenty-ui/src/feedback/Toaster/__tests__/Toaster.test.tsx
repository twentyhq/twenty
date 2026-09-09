import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { ToastProvider } from '@ui/feedback/Toast/ToastProvider';

import { Toaster } from '../Toaster';
import styles from '../Toaster.module.scss';

const ToastWrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

runComponentConformance({
  name: 'Toaster',
  element: <Toaster />,
  wrapper: ToastWrapper,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});
