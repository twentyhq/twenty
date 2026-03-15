import { render, screen } from '@testing-library/react';

import { SkeletonRow } from '../SkeletonRow';

describe('SkeletonRow', () => {
  it('should render avatar and text skeletons by default', () => {
    render(<SkeletonRow />);

    // 1 circular avatar + 2 text lines = 3 skeleton elements
    const skeletonElements = screen.getAllByRole('status');

    expect(skeletonElements).toHaveLength(3);
  });

  it('should render without avatar when hasAvatar is false', () => {
    render(<SkeletonRow hasAvatar={false} />);

    // Only 2 text lines, no avatar
    const skeletonElements = screen.getAllByRole('status');

    expect(skeletonElements).toHaveLength(2);
  });

  it('should render the specified number of text lines', () => {
    render(<SkeletonRow textLines={4} />);

    // 1 avatar + 4 text lines = 5 skeleton elements
    const skeletonElements = screen.getAllByRole('status');

    expect(skeletonElements).toHaveLength(5);
  });

  it('should render without avatar and with custom text lines', () => {
    render(<SkeletonRow hasAvatar={false} textLines={1} />);

    const skeletonElements = screen.getAllByRole('status');

    expect(skeletonElements).toHaveLength(1);
  });

  it('should apply custom className to the container', () => {
    const { container } = render(
      <SkeletonRow className="custom-skeleton-row" />,
    );

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('custom-skeleton-row');
  });

  it('should apply inline width style when width is provided as number', () => {
    const { container } = render(<SkeletonRow width={400} />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveStyle({ width: '400px' });
  });

  it('should apply inline width style when width is provided as string', () => {
    const { container } = render(<SkeletonRow width="50%" />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveStyle({ width: '50%' });
  });

  it('should not have inline width style when width is not provided', () => {
    const { container } = render(<SkeletonRow />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.style.width).toBe('');
  });
});
