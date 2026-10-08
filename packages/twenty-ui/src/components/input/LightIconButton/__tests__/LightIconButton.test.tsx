import { render, screen } from '@testing-library/react';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconSearch } from '@ui/icon';

import { LightIconButton } from '../LightIconButton';
import styles from '../LightIconButton.module.scss';

runComponentConformance({
  name: 'LightIconButton',
  element: (
    <LightIconButton aria-label="Search">
      <IconSearch />
    </LightIconButton>
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

describe('LightIconButton appearance', () => {
  it('retains its standalone defaults', () => {
    render(
      <LightIconButton aria-label="Search">
        <IconSearch />
      </LightIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Search' });

    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('inherits omitted appearance from ButtonGroup', () => {
    render(
      <ButtonGroup variant="solid" size="md">
        <LightIconButton aria-label="Search">
          <IconSearch />
        </LightIconButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Search' });

    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('uses explicit appearance before ButtonGroup defaults', () => {
    render(
      <ButtonGroup variant="solid" size="md">
        <LightIconButton aria-label="Search" variant="outline" size="sm">
          <IconSearch />
        </LightIconButton>
      </ButtonGroup>,
    );

    const button = screen.getByRole('button', { name: 'Search' });

    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });
});
