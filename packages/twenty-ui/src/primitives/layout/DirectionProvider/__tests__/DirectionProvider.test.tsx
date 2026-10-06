import { useDirection } from '@base-ui/react/direction-provider';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { DirectionProvider } from '../DirectionProvider';
import { useProvidedTextDirection } from '../internal/useProvidedTextDirection';

const DirectionProbe = ({ name }: { name: string }) => {
  const baseDirection = useDirection();
  const providedDirection = useProvidedTextDirection();

  return (
    <span aria-label={name}>
      {baseDirection}:{providedDirection ?? 'inherited'}
    </span>
  );
};

it('preserves direction inheritance without introducing a DOM wrapper', () => {
  const { container, rerender } = render(
    <>
      <DirectionProbe name="Outside" />
      <DirectionProvider direction="rtl">
        <DirectionProbe name="Parent" />
        <DirectionProvider direction="ltr">
          <DirectionProbe name="Nested" />
        </DirectionProvider>
      </DirectionProvider>
    </>,
  );

  expect(screen.getByLabelText('Outside')).toHaveTextContent('ltr:inherited');
  expect(screen.getByLabelText('Parent')).toHaveTextContent('rtl:rtl');
  expect(screen.getByLabelText('Nested')).toHaveTextContent('ltr:ltr');
  expect(container.children).toHaveLength(3);

  rerender(
    <DirectionProvider direction="ltr">
      <DirectionProbe name="Parent" />
    </DirectionProvider>,
  );
  expect(screen.getByLabelText('Parent')).toHaveTextContent('ltr:ltr');
});

it('uses the upstream optional direction and children contract', () => {
  const { rerender } = render(
    <DirectionProvider>
      <DirectionProbe name="Default" />
    </DirectionProvider>,
  );
  expect(screen.getByLabelText('Default')).toHaveTextContent('ltr:ltr');

  rerender(<DirectionProvider />);
  expect(screen.queryByLabelText('Default')).toBeNull();
});
