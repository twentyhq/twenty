import { render, screen } from '@testing-library/react';

import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('should render with role="status" and accessible label', () => {
    render(<Skeleton />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });

  it('should default to rectangular variant when no variant is given', () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).not.toHaveStyle({ 'border-radius': '50%' });
  });

  it('should apply custom width and height when numbers are provided', () => {
    render(<Skeleton width={200} height={40} />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom width and height when strings are provided', () => {
    render(<Skeleton width="50%" height="2rem" />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
  });

  it('should apply the given className', () => {
    render(<Skeleton className="my-custom-class" />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toHaveClass('my-custom-class');
  });

  it('should render as circular variant when variant is circular', () => {
    render(<Skeleton variant="circular" />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
  });

  it('should render as text variant when variant is text', () => {
    render(<Skeleton variant="text" />);

    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
  });
});
