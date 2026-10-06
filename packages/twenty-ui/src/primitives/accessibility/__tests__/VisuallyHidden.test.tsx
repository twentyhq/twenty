import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '@ui/primitives/input/Button/Button';

import { VisuallyHidden } from '../components/VisuallyHidden';
import styles from '../components/VisuallyHidden.module.scss';

runComponentConformance({
  name: 'VisuallyHidden',
  element: <VisuallyHidden>Supporting text</VisuallyHidden>,
  ownClassName: styles.root,
  refInstanceOf: HTMLSpanElement,
  renderPropTagName: 'div',
});

it('supplies accessible text and native description association', () => {
  render(
    <>
      <Button aria-describedby="action-description">
        <VisuallyHidden>Add record</VisuallyHidden>
      </Button>
      <VisuallyHidden id="action-description">Creates a contact</VisuallyHidden>
    </>,
  );

  expect(
    screen.getByRole('button', { name: 'Add record' }),
  ).toHaveAccessibleDescription('Creates a contact');
  expect(screen.getByText('Add record').tagName).toBe('SPAN');
});
