import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TintedIconTile } from '../TintedIconTile';

runComponentConformance({
  name: 'TintedIconTile',
  element: (
    <TintedIconTile
      icon={
        <svg>
          <path d="M0 0h8v8H0z" />
        </svg>
      }
    />
  ),
  refInstanceOf: HTMLDivElement,
});

describe('TintedIconTile content', () => {
  it('keeps custom icon nodes decorative and lets the root carry a label', () => {
    render(
      <TintedIconTile
        icon={<svg role="img" aria-label="Internal artwork" />}
        role="img"
        aria-label="Companies"
      />,
    );

    expect(screen.getByRole('img', { name: 'Companies' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Internal artwork' })).toBeNull();
  });

  it('allows styles to override palette defaults and tile geometry', () => {
    render(
      <TintedIconTile
        icon={<svg width="20" height="20" />}
        color="blue"
        data-testid="tile"
        style={{
          width: 32,
          height: 32,
          color: 'red',
          backgroundColor: 'black',
        }}
      />,
    );

    expect(screen.getByTestId('tile')).toHaveStyle(
      'width: 32px; height: 32px; color: rgb(255, 0, 0); background-color: rgb(0, 0, 0)',
    );
  });
});
