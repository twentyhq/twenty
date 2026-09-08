import { render, screen } from '@testing-library/react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Input } from '@ui/input/Input/Input';
import inputStyles from '@ui/input/Input/Input.module.scss';

import { InputGroup } from '../InputGroup';
import styles from '../InputGroup.module.scss';

runComponentConformance({
  name: 'InputGroup',
  element: (
    <InputGroup>
      <Input aria-label="Grouped" />
    </InputGroup>
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

describe('InputGroup', () => {
  it('renders the start and end elements around the input', () => {
    render(
      <InputGroup startElement="$" endElement="USD">
        <Input aria-label="Amount" />
      </InputGroup>,
    );

    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders only the input when no element is given', () => {
    render(
      <InputGroup>
        <Input aria-label="Amount" />
      </InputGroup>,
    );

    expect(
      screen.getByRole('textbox', { name: 'Amount' }).parentElement?.children,
    ).toHaveLength(1);
  });

  it('passes its size to the input and marks it as grouped', () => {
    render(
      <InputGroup size="sm">
        <Input aria-label="Amount" />
      </InputGroup>,
    );

    const input = screen.getByRole('textbox', { name: 'Amount' });

    expect(input).toHaveClass(inputStyles.sm);
    expect(input).toHaveAttribute('data-grouped');
  });

  it('lets an explicit input size win over the group size', () => {
    render(
      <InputGroup size="sm">
        <Input aria-label="Amount" size="md" />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveClass(
      inputStyles.md,
    );
  });
});
