import { render, screen } from '@testing-library/react';

import { SkeletonText } from '../SkeletonText';

describe('SkeletonText', () => {
  it('should render 3 skeleton lines by default', () => {
    render(<SkeletonText />);

    const skeletonLines = screen.getAllByRole('status');

    expect(skeletonLines).toHaveLength(3);
  });

  it('should render the specified number of lines', () => {
    render(<SkeletonText lines={5} />);

    const skeletonLines = screen.getAllByRole('status');

    expect(skeletonLines).toHaveLength(5);
  });

  it('should render a single line when lines is 1', () => {
    render(<SkeletonText lines={1} />);

    const skeletonLines = screen.getAllByRole('status');

    expect(skeletonLines).toHaveLength(1);
  });

  it('should apply custom className to the container', () => {
    const { container } = render(
      <SkeletonText className="custom-skeleton-text" />,
    );

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('custom-skeleton-text');
  });

  it('should render all skeleton lines with the Loading aria-label', () => {
    render(<SkeletonText lines={4} />);

    const skeletonLines = screen.getAllByRole('status');

    skeletonLines.forEach((line) => {
      expect(line).toHaveAttribute('aria-label', 'Loading');
    });
  });
});
