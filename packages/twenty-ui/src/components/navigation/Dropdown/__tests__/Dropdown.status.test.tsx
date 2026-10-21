import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../Dropdown';

import styles from '../Dropdown.module.scss';

describe('Dropdown status parts', () => {
  it.each([
    { name: 'empty', Component: Dropdown.Empty, expectedBusy: 'false' },
    { name: 'loading', Component: Dropdown.Loading, expectedBusy: 'true' },
  ])(
    'preserves the native $name adapter contract with shared typography',
    ({ Component, expectedBusy }) => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Component
          ref={ref}
          color="rebeccapurple"
          className="consumer-status"
          style={{ marginTop: '7px' }}
          role="note"
          aria-live="off"
          aria-busy="false"
        >
          Status content
        </Component>,
      );

      const status = screen.getByRole('status');

      expect(ref.current).toBe(status);
      expect(status).toHaveAttribute('color', 'rebeccapurple');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveAttribute('aria-busy', expectedBusy);
      expect(status).toHaveAttribute('data-size', 'sm');
      expect(status).toHaveAttribute('data-color', 'secondary');
      expect(status).toHaveClass(styles.status, 'consumer-status');
      expect(status.style.marginTop).toBe('7px');
      expect(status).toHaveTextContent('Status content');
    },
  );
});
