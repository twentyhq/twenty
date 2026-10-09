import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Separator } from '../Separator';
import styles from '../Separator.module.scss';

runComponentConformance({
  name: 'Separator',
  element: <Separator />,
  ownClassName: styles.root,
  refInstanceOf: HTMLDivElement,
});

describe('Separator semantics', () => {
  it('updates the accessible orientation and Base UI render state', () => {
    const { rerender } = render(<Separator aria-label="Sections" />);

    expect(screen.getByRole('separator', { name: 'Sections' })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );

    rerender(
      <Separator
        aria-label="Sections"
        orientation="vertical"
        className={({ orientation }) => `divider-${orientation}`}
        style={({ orientation }) => ({
          height: orientation === 'vertical' ? 24 : 1,
        })}
        render={(props, { orientation }) => (
          <span {...props} data-render-orientation={orientation} />
        )}
      />,
    );

    const separator = screen.getByRole('separator', { name: 'Sections' });
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-render-orientation', 'vertical');
    expect(separator).toHaveClass(styles.root, 'divider-vertical');
    expect(separator).toHaveStyle({ height: '24px' });
  });
});
