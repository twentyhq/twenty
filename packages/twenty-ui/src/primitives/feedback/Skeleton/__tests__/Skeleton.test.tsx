import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';

import { Skeleton } from '@ui/primitives/feedback';

runComponentConformance({
  name: 'Skeleton',
  element: <Skeleton width={120} height={16} />,
  refInstanceOf: HTMLSpanElement,
  ownClassName: 'root',
});

it('keeps placeholder shapes out of the accessibility tree', () => {
  render(<Skeleton data-testid="placeholder" />);

  expect(screen.getByTestId('placeholder')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('lets native styles override dimensions and colors', () => {
  render(
    <Skeleton
      data-testid="placeholder"
      width={120}
      height={16}
      borderRadius={4}
      baseColor="red"
      style={{
        width: '50%',
        height: 32,
        borderRadius: 8,
        backgroundColor: 'blue',
      }}
    />,
  );

  expect(screen.getByTestId('placeholder')).toHaveStyle(
    'width: 50%; height: 32px; border-radius: 8px; background-color: rgb(0, 0, 255)',
  );
});
