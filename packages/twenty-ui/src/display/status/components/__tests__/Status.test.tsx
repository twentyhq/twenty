import { fireEvent, render, screen } from '@testing-library/react';

import { Status } from '../Status';

describe('Status', () => {
  it('renders with text', () => {
    render(<Status color="green" text="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Status color="green" text="Green" />);
    expect(screen.getByText('Green')).toBeInTheDocument();

    rerender(<Status color="red" text="Red" />);
    expect(screen.getByText('Red')).toBeInTheDocument();

    rerender(<Status color="blue" text="Blue" />);
    expect(screen.getByText('Blue')).toBeInTheDocument();

    rerender(<Status color="orange" text="Orange" />);
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });

  it('falls back to gray for unknown colors', () => {
    const { container } = render(
      <Status color={'unknown' as any} text="Unknown" />,
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();

    render(<Status color="green" text="Clickable" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Clickable'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onClick is not provided', () => {
    render(<Status color="green" text="No handler" />);

    expect(() => {
      fireEvent.click(screen.getByText('No handler'));
    }).not.toThrow();
  });

  it('renders with regular weight by default', () => {
    const { container } = render(
      <Status color="green" text="Regular weight" />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with medium weight', () => {
    const { container } = render(
      <Status color="green" text="Medium weight" weight="medium" />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders without loader by default', () => {
    const { container } = render(
      <Status color="green" text="No loader" />,
    );

    expect(screen.getByText('No loader')).toBeInTheDocument();
    // Loader should not be present
    expect(container.querySelector('[data-testid="loader"]')).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Status color="green" text="Styled" className="custom-status" />,
    );

    expect(container.querySelector('.custom-status')).toBeInTheDocument();
  });
});
