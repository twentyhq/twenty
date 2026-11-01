import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import inputStyles from '@ui/primitives/input/Input/Input.module.scss';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Input } from '@ui/primitives/input/Input/Input';

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

it('keeps native layout customization separate from input props and child size precedence', () => {
  const groupRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  render(
    <InputGroup
      ref={groupRef}
      size="sm"
      aria-label="Search layout"
      style={{ maxWidth: 240 }}
      render={<section />}
      startElement="@"
      endElement=".com"
    >
      <Input aria-label="Inherited" />
      <Input ref={inputRef} aria-label="Explicit" name="email" size="md" />
    </InputGroup>,
  );
  const layout = screen.getByRole('region', { name: 'Search layout' });
  const explicitInput = screen.getByRole('textbox', { name: 'Explicit' });
  expect(groupRef.current).toBe(layout);
  expect(layout).toHaveStyle({ maxWidth: '240px' });
  expect(inputRef.current).toBe(explicitInput);
  expect(explicitInput).toHaveAttribute('name', 'email');
  expect(explicitInput).toHaveClass(inputStyles.md);
  expect(explicitInput).not.toHaveClass(inputStyles.sm);
  expect(screen.getByRole('textbox', { name: 'Inherited' })).toHaveClass(
    inputStyles.sm,
  );
  expect(screen.getByText('@')).toBeInTheDocument();
  expect(screen.getByText('.com')).toBeInTheDocument();
});
