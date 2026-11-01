import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
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

describe('MainButton inherited color contract', () => {
  it('rejects inherited color with its standalone solid default', () => {
    expect(() =>
      renderToStaticMarkup(<MainButton color="inherit">Save</MainButton>),
    ).toThrow(
      'Button color="inherit" does not support variant="solid". Use outline, ghost, soft, or link.',
    );
  });

  it('accepts an explicit non-solid variant before solid group defaults', () => {
    expect(() =>
      renderToStaticMarkup(
        <ButtonGroup variant="solid" color="inherit">
          <MainButton variant="outline">Preview</MainButton>
        </ButtonGroup>,
      ),
    ).not.toThrow();
  });
});
