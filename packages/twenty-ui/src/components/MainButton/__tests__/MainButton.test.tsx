import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { MainButton } from '../MainButton';
import styles from '../MainButton.module.scss';

runComponentConformance({
  name: 'MainButton',
  element: <MainButton>Save changes</MainButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

it('evaluates consumer classes with the loading button state', () => {
  render(
    <ThemeProvider colorScheme="light">
      <MainButton
        loading
        className={({ disabled }) =>
          disabled ? 'unavailable-action' : undefined
        }
      >
        Save changes
      </MainButton>
    </ThemeProvider>,
  );

  expect(screen.getByRole('button', { name: 'Save changes' })).toHaveClass(
    styles.button,
    'unavailable-action',
  );
});
