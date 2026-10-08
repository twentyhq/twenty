import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AvatarGroup } from '../AvatarGroup';

const avatars = [
  'Alice',
  'Bob',
  'Carla',
  'Dylan',
  'Emma',
  'Finn',
  'Grace',
  'Hugo',
].map((name) => <span key={name} role="img" aria-label={name} />);

runComponentConformance({
  name: 'AvatarGroup',
  element: <AvatarGroup avatars={avatars} />,
  refInstanceOf: HTMLDivElement,
});

describe('AvatarGroup overflow', () => {
  it('shows three supplied avatars plus an additional indicator for the five hidden avatars', () => {
    render(<AvatarGroup avatars={avatars} maxVisible={3} />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Carla' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Dylan' })).toBeNull();
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('includes unloaded avatars in the hidden count', () => {
    render(<AvatarGroup avatars={avatars.slice(0, 3)} total={20} />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('+17')).toBeInTheDocument();
  });

  it('passes updated totals and limits to the custom overflow renderer', () => {
    const renderOverflow = vi.fn((hiddenCount: number) => (
      <span>{hiddenCount} more people</span>
    ));
    const { rerender } = render(
      <AvatarGroup
        avatars={avatars}
        maxVisible={3}
        renderOverflow={renderOverflow}
      />,
    );

    expect(screen.getByText('5 more people')).toBeInTheDocument();
    expect(screen.queryByText('+5')).toBeNull();
    expect(renderOverflow).toHaveBeenLastCalledWith(5);

    rerender(
      <AvatarGroup
        avatars={avatars.slice(0, 3)}
        maxVisible={2}
        total={20}
        renderOverflow={renderOverflow}
      />,
    );

    expect(screen.getByText('18 more people')).toBeInTheDocument();
    expect(renderOverflow).toHaveBeenLastCalledWith(18);
  });

  it('ignores empty child slots when counting and applying the visible limit', () => {
    render(
      <AvatarGroup
        avatars={[null, avatars[0], false, avatars[1]]}
        maxVisible={1}
      />,
    );

    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Bob' })).toBeNull();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('does not invoke custom overflow rendering when every avatar is visible', () => {
    const renderOverflow = vi.fn(() => <span>More people</span>);

    render(
      <AvatarGroup
        avatars={avatars}
        maxVisible={Infinity}
        renderOverflow={renderOverflow}
      />,
    );

    expect(screen.getAllByRole('img')).toHaveLength(8);
    expect(renderOverflow).not.toHaveBeenCalled();
  });

  it('omits the entire custom overflow slot when the renderer returns null', () => {
    render(
      <AvatarGroup
        avatars={avatars}
        maxVisible={1}
        renderOverflow={() => null}
        data-testid="group"
      />,
    );

    expect(screen.getByTestId('group').children).toHaveLength(1);
    expect(screen.queryByText('+7')).toBeNull();
  });

  it('keeps an empty collection absent until a total supplies hidden avatars', () => {
    const { rerender } = render(
      <AvatarGroup avatars={[]} data-testid="group" />,
    );

    expect(screen.queryByTestId('group')).toBeNull();

    rerender(<AvatarGroup avatars={[]} total={20} data-testid="group" />);

    expect(screen.getByTestId('group')).toHaveTextContent('+20');
  });

  it.each([
    { maxVisible: 0, total: 20, visible: 0, hidden: 20 },
    { maxVisible: -1, total: -2, visible: 0, hidden: 8 },
    { maxVisible: 2.9, total: 20.9, visible: 2, hidden: 18 },
    { maxVisible: 3, total: 2, visible: 3, hidden: 5 },
    { maxVisible: NaN, total: NaN, visible: 0, hidden: 8 },
    { maxVisible: 3, total: Infinity, visible: 3, hidden: 5 },
  ])(
    'keeps counts predictable for maxVisible=$maxVisible and total=$total',
    ({ maxVisible, total, visible, hidden }) => {
      render(
        <AvatarGroup avatars={avatars} maxVisible={maxVisible} total={total} />,
      );

      expect(screen.queryAllByRole('img')).toHaveLength(visible);
      expect(screen.getByText(`+${hidden}`)).toBeInTheDocument();
    },
  );
});
