/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { FormTagInput } from '@/design-system/components/Form/TagInput';

function Harness() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <FormTagInput
      values={values}
      onValuesChange={setValues}
      ariaLabel="skills"
      suggestions={['Workflows']}
      searchPool={['Kubernetes']}
    />
  );
}

describe('FormTagInput searchPool', () => {
  it('shows only `suggestions` as ghost chips, not the pool', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: '+ Workflows' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Kubernetes' })).toBeNull();
  });

  it('autocompletes against the pool', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole('combobox'), 'kuber');
    expect(screen.getByRole('option', { name: 'Kubernetes' })).toBeInTheDocument();
  });
});
