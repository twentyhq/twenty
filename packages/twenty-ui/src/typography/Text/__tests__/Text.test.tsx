import { render, screen } from '@testing-library/react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Text } from '../Text';
import styles from '../Text.module.scss';

runComponentConformance({
  name: 'Text',
  element: <Text>Body</Text>,
  refInstanceOf: HTMLDivElement,
});

describe('Text', () => {
  it('adds the truncate class when truncate is set', () => {
    render(
      <Text truncate data-testid="text">
        Body
      </Text>,
    );

    expect(screen.getByTestId('text')).toHaveClass(styles.truncate);
  });

  it('adds the line clamp class and custom property when lineClamp is set', () => {
    render(
      <Text lineClamp={2} data-testid="text">
        Body
      </Text>,
    );

    const text = screen.getByTestId('text');

    expect(text).toHaveClass(styles.lineClamp);
    expect(text.style.getPropertyValue('--text-line-clamp')).toBe('2');
  });

  it('renders the element given to render with the merged className', () => {
    render(
      <Text
        render={<span className="from-render" />}
        className="consumer"
        data-testid="text"
      >
        Body
      </Text>,
    );

    const text = screen.getByTestId('text');

    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('from-render', 'consumer');
  });

  it('places the consumer className last', () => {
    render(
      <Text truncate className="consumer" data-testid="text">
        Body
      </Text>,
    );

    expect(screen.getByTestId('text').className).toBe(
      `${styles.truncate} consumer`,
    );
  });
});
