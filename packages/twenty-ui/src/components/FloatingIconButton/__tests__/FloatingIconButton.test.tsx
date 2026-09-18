import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconPlus } from '@ui/icon';

import { FloatingIconButton } from '../FloatingIconButton';
import styles from '../FloatingIconButton.module.scss';

runComponentConformance({
  name: 'FloatingIconButton',
  element: (
    <FloatingIconButton aria-label="Add widget">
      <IconPlus />
    </FloatingIconButton>
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  renderPropTagName: 'button',
});

it('merges state-dependent classes through the icon button composition', () => {
  render(
    <FloatingIconButton
      aria-label="Add widget"
      disabled
      className={({ disabled }) => (disabled ? 'unavailable' : 'available')}
    >
      <IconPlus />
    </FloatingIconButton>,
  );

  expect(screen.getByRole('button', { name: 'Add widget' })).toHaveClass(
    styles.button,
    'unavailable',
  );
});
