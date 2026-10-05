import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Heading } from '../Heading';
import styles from '../Heading.module.scss';

runComponentConformance({
  name: 'Heading',
  element: <Heading>Workspace</Heading>,
  ownClassName: styles.heading,
  refInstanceOf: HTMLHeadingElement,
});

describe('Heading', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders level %i independently of its visual size',
    (level) => {
      render(
        <Heading level={level} size="sm" color="secondary">
          Workspace
        </Heading>,
      );

      const heading = screen.getByRole('heading', { name: 'Workspace', level });

      expect(heading).toHaveAttribute('data-size', 'sm');
      expect(heading).toHaveAttribute('data-color', 'secondary');
    },
  );
});
