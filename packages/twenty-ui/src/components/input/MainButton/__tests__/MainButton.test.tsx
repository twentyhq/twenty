import { render, screen } from '@testing-library/react';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { MainButton } from '../MainButton';
import styles from '../MainButton.module.scss';

runComponentConformance({
  name: 'MainButton',
  element: <MainButton>Save changes</MainButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

describe('MainButton appearance', () => {
  it('retains its standalone defaults', () => {
    render(<MainButton>Save changes</MainButton>);

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'solid');
  });

  it('inherits omitted appearance from ButtonGroup', () => {
    render(
      <ButtonGroup variant="ghost">
        <MainButton>Save changes</MainButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'ghost');
  });

  it('uses explicit appearance before ButtonGroup defaults', () => {
    render(
      <ButtonGroup variant="ghost">
        <MainButton variant="outline">Save changes</MainButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'outline');
  });
});
