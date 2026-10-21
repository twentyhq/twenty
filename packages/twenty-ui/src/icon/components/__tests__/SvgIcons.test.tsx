import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import IconGoogleRaw from '@assets/icons/google.svg?react';

describe('SVG icon generation', () => {
  it('marks imported SVG roots for shared icon styling without caller attributes', () => {
    render(<IconGoogleRaw role="img" aria-label="Google" />);

    expect(screen.getByRole('img', { name: 'Google' })).toHaveAttribute(
      'data-twenty-icon',
      '',
    );
  });
});
