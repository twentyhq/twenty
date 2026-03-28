import { fireEvent, render, screen } from '@testing-library/react';

import {
  Checkbox,
  CheckboxAccent,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
} from '../Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox checked={false} />);

    const input = screen.getByTestId('input-checkbox');

    expect(input).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked={true} />);

    const input = screen.getByTestId('input-checkbox');

    expect(input).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();

    render(<Checkbox checked={false} onChange={handleChange} />);

    const input = screen.getByTestId('input-checkbox');
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onCheckedChange with the new checked value', () => {
    const handleCheckedChange = jest.fn();

    render(
      <Checkbox checked={false} onCheckedChange={handleCheckedChange} />,
    );

    const input = screen.getByTestId('input-checkbox');
    fireEvent.click(input);

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Checkbox checked={false} disabled />);

    const input = screen.getByTestId('input-checkbox');

    expect(input).toBeDisabled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Checkbox checked={false} variant={CheckboxVariant.Primary} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();

    rerender(
      <Checkbox checked={false} variant={CheckboxVariant.Secondary} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();

    rerender(
      <Checkbox checked={false} variant={CheckboxVariant.Tertiary} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Checkbox checked={false} size={CheckboxSize.Large} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();

    rerender(<Checkbox checked={false} size={CheckboxSize.Small} />);
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();
  });

  it('renders with different shapes', () => {
    const { rerender } = render(
      <Checkbox checked={false} shape={CheckboxShape.Squared} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();

    rerender(<Checkbox checked={false} shape={CheckboxShape.Rounded} />);
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();
  });

  it('renders with different accents', () => {
    const { rerender } = render(
      <Checkbox checked={true} accent={CheckboxAccent.Blue} />,
    );
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();

    rerender(<Checkbox checked={true} accent={CheckboxAccent.Orange} />);
    expect(screen.getByTestId('input-checkbox')).toBeInTheDocument();
  });

  it('renders indeterminate state with minus icon', () => {
    const { container } = render(
      <Checkbox checked={false} indeterminate={true} />,
    );

    const svgElements = container.querySelectorAll('svg');

    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('toggles from unchecked to checked on click', () => {
    const handleCheckedChange = jest.fn();

    render(
      <Checkbox checked={false} onCheckedChange={handleCheckedChange} />,
    );

    const input = screen.getByTestId('input-checkbox');
    fireEvent.click(input);

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Checkbox checked={false} className="custom-checkbox" />,
    );

    expect(container.querySelector('.custom-checkbox')).toBeInTheDocument();
  });
});
