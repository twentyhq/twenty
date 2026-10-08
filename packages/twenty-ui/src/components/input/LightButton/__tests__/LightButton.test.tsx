import { render, screen } from '@testing-library/react';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { LightButton } from '../LightButton';
import styles from '../LightButton.module.scss';

runComponentConformance({
  name: 'LightButton',
  element: <LightButton>Add filter</LightButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

describe('LightButton appearance', () => {
  it('retains its standalone defaults', () => {
    render(<LightButton>Save changes</LightButton>);

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('inherits omitted appearance from ButtonGroup', () => {
    render(
      <ButtonGroup variant="solid" size="md">
        <LightButton>Save changes</LightButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('uses explicit appearance before ButtonGroup defaults', () => {
    render(
      <ButtonGroup variant="solid" size="md">
        <LightButton variant="outline" size="sm">
          Save changes
        </LightButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });
});
