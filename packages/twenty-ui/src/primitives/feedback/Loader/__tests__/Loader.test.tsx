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
  render(<Loader aria-hidden="true">Loading</Loader>);

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText('Loading')).toHaveAttribute('aria-hidden', 'true');
});

it('supports a named live status and caller-provided accessible content', () => {
  render(
    <Loader role="status" aria-label="Saving changes">
      Saving
    </Loader>,
  );

  const status = screen.getByRole('status', { name: 'Saving changes' });

  expect(status).not.toHaveAttribute('aria-hidden');
  expect(status).toHaveTextContent('Saving');
  expect(status.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
