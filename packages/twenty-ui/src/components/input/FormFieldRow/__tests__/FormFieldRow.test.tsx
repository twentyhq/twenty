import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '@ui/primitives/input/Button/Button';
import { Input } from '@ui/primitives/input/Input/Input';

import { FormFieldRow } from '../FormFieldRow';

runComponentConformance({
  name: 'FormFieldRow',
  element: <FormFieldRow label="Subject">Project update</FormFieldRow>,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'div',
});

it('names the group without relabelling its nested controls or announcing decoration', () => {
  render(
    <FormFieldRow
      label="To"
      startIcon={<svg role="img" aria-label="Internal artwork" />}
      trailing={<Button>Cc/Bcc</Button>}
    >
      <Input aria-label="Recipient address" variant="plain" />
    </FormFieldRow>,
  );

  const group = screen.getByRole('group', { name: 'To' });

  expect(
    within(group).getByRole('textbox', { name: 'Recipient address' }),
  ).toBeInTheDocument();
  expect(
    within(group).getByRole('button', { name: 'Cc/Bcc' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByRole('separator')).not.toBeInTheDocument();
});

it('accepts an external group name without a visible label', () => {
  render(
    <FormFieldRow aria-labelledby="event-options-label" hasDivider={false}>
      <span id="event-options-label">Event options</span>
    </FormFieldRow>,
  );

  expect(
    screen.getByRole('group', { name: 'Event options' }),
  ).toBeInTheDocument();
});
