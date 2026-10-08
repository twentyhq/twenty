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
