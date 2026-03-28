import { fireEvent, render, screen } from '@testing-library/react';

import { Toggle } from '../Toggle';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      create: (component: React.ComponentType) => component,
    },
  };
});

describe('Toggle', () => {
  it('renders with default props', () => {
    render(<Toggle />);

    const input = screen.getByRole('checkbox');

    expect(input).not.toBeChecked();
  });

  it('renders as checked when value is true', () => {
    render(<Toggle value={true} />);

    const input = screen.getByRole('checkbox');

    expect(input).toBeChecked();
  });

  it('renders as unchecked when value is false', () => {
    render(<Toggle value={false} />);

    const input = screen.getByRole('checkbox');

    expect(input).not.toBeChecked();
  });

  it('calls onChange when toggled', () => {
    const handleChange = jest.fn();

    render(<Toggle value={false} onChange={handleChange} />);

    const input = screen.getByRole('checkbox');
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when toggling off', () => {
    const handleChange = jest.fn();

    render(<Toggle value={true} onChange={handleChange} />);

    const input = screen.getByRole('checkbox');
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders with small size', () => {
    const { container } = render(<Toggle toggleSize="small" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    const { container } = render(<Toggle toggleSize="medium" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Toggle disabled={true} />);

    const input = screen.getByRole('checkbox');

    expect(input).toBeDisabled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Toggle value={false} disabled={true} />);

    const input = screen.getByRole('checkbox');

    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Toggle className="custom-toggle" />);

    expect(container.querySelector('.custom-toggle')).toBeInTheDocument();
  });

  it('renders with custom id', () => {
    render(<Toggle id="my-toggle" />);

    const input = document.getElementById('my-toggle');

    expect(input).toBeInTheDocument();
  });
});
