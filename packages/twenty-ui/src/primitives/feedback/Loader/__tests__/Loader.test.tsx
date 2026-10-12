import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';

import { Loader } from '@ui/primitives/feedback';

runComponentConformance({
  name: 'Loader',
  element: <Loader color="blue" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: 'container',
});

it('leaves announcements to the caller and hides a decorative loader', () => {
  render(<Loader aria-hidden="true" data-testid="decorative-loader" />);

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByTestId('decorative-loader')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

it('supports a named live status with a decorative animated dot', () => {
  render(<Loader role="status" aria-label="Saving changes" />);

  const status = screen.getByRole('status', { name: 'Saving changes' });

  expect(status).not.toHaveAttribute('aria-hidden');
  expect(status.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
