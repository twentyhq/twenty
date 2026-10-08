import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Shortcut } from '../Shortcut';

describe('Shortcut native presentation', () => {
  it('forwards native span props and ref while keeping formatting explicit', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSpanElement>();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Shortcut
        shortcut={['Mod', 'K']}
        platform="other"
        combinationSeparator=" + "
        variant="text"
        ref={ref}
        title="Search hint"
        className="caller-hint"
        style={{ marginTop: 7 }}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
      />,
    );
    const hint = screen.getByRole('img', { name: 'Control + K' });
    expect(ref.current).toBe(hint);
    expect(hint.tagName).toBe('SPAN');
    expect(hint).toHaveTextContent('Ctrl + K');
    expect(hint).toHaveClass('caller-hint');
    expect(hint).toHaveStyle({ marginTop: '7px' });
    expect(hint).toHaveAttribute('title', 'Search hint');
    await user.click(hint);
    await user.keyboard('k');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
