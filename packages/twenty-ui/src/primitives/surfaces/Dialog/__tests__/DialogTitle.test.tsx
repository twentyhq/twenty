import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Dialog } from '../Dialog';

import styles from '../DialogTitle.module.scss';

const DialogRootWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root>{children}</Dialog.Root>
);

runComponentConformance({
  name: 'Dialog.Title',
  element: <Dialog.Title>Grant credits</Dialog.Title>,
  ownClassName: styles.title,
  refInstanceOf: HTMLHeadingElement,
  wrapper: DialogRootWrapper,
});

it('labels the dialog and keeps the title level independent of its size', () => {
  render(
    <ThemeProvider colorScheme="light">
      <Dialog.Root open>
        <Dialog.Popup initialFocus={false}>
          <Dialog.Title level={3} size="sm">
            Grant credits
          </Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>
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
