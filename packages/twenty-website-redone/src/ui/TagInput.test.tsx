/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { TagInput } from './TagInput';

function TagInputHarness() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <TagInput
      ariaLabel="Skills"
      onValuesChange={setValues}
      placeholder="Add a skill…"
      removeLabel={(tag) => `Remove ${tag}`}
      searchPool={['Kubernetes']}
      suggestions={['Workflows']}
      values={values}
    />
  );
}

describe('TagInput', () => {
  it('offers the suggestions as quick-add chips but never the search pool', () => {
    render(<TagInputHarness />);
    expect(
      screen.getByRole('button', { name: '+ Workflows' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '+ Kubernetes' }),
    ).not.toBeInTheDocument();
  });

  it('autocompletes the menu against both the suggestions and the search pool', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);
    await user.type(screen.getByRole('combobox'), 'kuber');
    expect(
      screen.getByRole('option', { name: 'Kubernetes' }),
    ).toBeInTheDocument();
  });

  it('adds a search-pool entry from the menu as a removable chip', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);
    await user.type(screen.getByRole('combobox'), 'kuber');
    await user.click(screen.getByRole('option', { name: 'Kubernetes' }));
    expect(
      screen.getByRole('button', { name: 'Remove Kubernetes' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
