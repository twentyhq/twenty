import { render, screen } from '@testing-library/react';

import { Banner } from '../Banner';

describe('Banner', () => {
  it('renders children text', () => {
    render(<Banner>Test banner message</Banner>);

    expect(screen.getByText('Test banner message')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Banner>Default banner</Banner>);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Default banner')).toBeInTheDocument();
  });

  it('renders with danger variant', () => {
    const { container } = render(
      <Banner variant="danger">Danger banner</Banner>,
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Danger banner')).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <Banner>
        <span data-testid="child-span">Complex child</span>
      </Banner>,
    );

    expect(screen.getByTestId('child-span')).toBeInTheDocument();
    expect(screen.getByText('Complex child')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Banner className="custom-banner">Styled banner</Banner>,
    );

    expect(container.querySelector('.custom-banner')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Banner>
        <span>First</span>
        <span>Second</span>
      </Banner>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
