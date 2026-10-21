import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';

import { DetailsRow } from '../DetailsRow';

runComponentConformance({
  name: 'DetailsRow',
  element: <DetailsRow label="Owner">Jordan Lee</DetailsRow>,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => <dl>{children}</dl>,
  renderPropTagName: 'div',
});

it('groups a term, its value and its action inside a description list', () => {
  render(
    <dl>
      <DetailsRow
        label={<strong>Owner</strong>}
        startIcon={<svg role="img" aria-label="Internal artwork" />}
        action={<Button aria-label="Change owner">Change</Button>}
      >
        Jordan Lee
      </DetailsRow>
      <DetailsRow label="Completed reviews">{0}</DetailsRow>
    </dl>,
  );

  const [ownerTerm, reviewsTerm] = screen.getAllByRole('term');
  const [ownerDescription, reviewsDescription] =
    screen.getAllByRole('definition');

  expect(ownerTerm).toHaveTextContent('Owner');
  expect(ownerDescription).toHaveTextContent('Jordan Lee');
  expect(
    within(ownerDescription!).getByRole('button', { name: 'Change owner' }),
  ).toBeInTheDocument();
  expect(reviewsTerm).toHaveTextContent('Completed reviews');
  expect(reviewsDescription).toHaveTextContent('0');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
