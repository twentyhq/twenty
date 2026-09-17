import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Modal } from '@ui/primitives/surfaces/Modal/Modal';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Dialog } from '../Dialog';

import styles from '../DialogTitle.module.scss';

const DialogRootWrapper = ({ children }: { children: ReactNode }) => (
  <DialogPrimitive.Root>{children}</DialogPrimitive.Root>
);

runComponentConformance({
  name: 'Dialog.Title',
  element: <Dialog.Title>Grant credits</Dialog.Title>,
  ownClassName: styles.title,
  refInstanceOf: HTMLHeadingElement,
  wrapper: DialogRootWrapper,
});

it('labels the modal and keeps the title level independent of its size', () => {
  render(
    <ThemeProvider colorScheme="light">
      <Modal isOpen>
        <Dialog.Title level={3} size="sm">
          Grant credits
        </Dialog.Title>
      </Modal>
    </ThemeProvider>,
  );

  const heading = screen.getByRole('heading', {
    name: 'Grant credits',
    level: 3,
  });

  expect(heading).toHaveAttribute('data-size', 'sm');
  expect(screen.getByRole('dialog', { name: 'Grant credits' })).toHaveAttribute(
    'aria-labelledby',
    heading.id,
  );
});
