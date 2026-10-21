import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Text } from '../Text';
import styles from '../Text.module.scss';

runComponentConformance({
  name: 'Text',
  element: <Text truncate>Body</Text>,
  ownClassName: styles.truncate,
  refInstanceOf: HTMLDivElement,
});

describe('Text', () => {
  it('preserves native typography without selecting a theme modifier', () => {
    render(
      <Text style={{ color: 'rebeccapurple', fontSize: '18px' }}>
        Inherited
      </Text>,
    );

    const text = screen.getByText('Inherited');

    expect(text).not.toHaveAttribute('data-size');
    expect(text).not.toHaveAttribute('data-weight');
    expect(text).not.toHaveAttribute('data-color');
    expect(text.style.color).toBe('rebeccapurple');
    expect(text.style.fontSize).toBe('18px');
  });

  it('targets semantic typography at the rendered text element', () => {
    render(
      <Text size="xs" weight="semibold" color="light" render={<span />}>
        Caption
      </Text>,
    );

    const text = screen.getByText('Caption');

    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveAttribute('data-size', 'xs');
    expect(text).toHaveAttribute('data-weight', 'semibold');
    expect(text).toHaveAttribute('data-color', 'light');
    expect(text).not.toHaveAttribute('size');
    expect(text).not.toHaveAttribute('weight');
    expect(text).not.toHaveAttribute('color');
  });

  it('renders caller-owned semantic content without automatic links', () => {
    render(
      <Text render={<p />} truncate>
        https://twenty.com
      </Text>,
    );
    expect(screen.getByText('https://twenty.com').tagName).toBe('P');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each([0, -1, 1.5, Number.NaN])(
    'ignores invalid line limits %s',
    (lineClamp) => {
      render(<Text lineClamp={lineClamp}>Description</Text>);
      expect(screen.getByText('Description')).not.toHaveClass(styles.lineClamp);
    },
  );
});
