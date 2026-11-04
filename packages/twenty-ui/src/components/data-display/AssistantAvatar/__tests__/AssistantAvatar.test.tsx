import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { AssistantAvatar } from '../AssistantAvatar';

describe('AssistantAvatar', () => {
  it('keeps an unlabeled character decorative and outside the tab order', () => {
    const ref = createRef<HTMLSpanElement>();

    render(<AssistantAvatar ref={ref} />);

    expect(ref.current).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current).not.toHaveAttribute('role');
    expect(ref.current).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes one accessible image when a caller supplies a name', () => {
    const { rerender } = render(
      <AssistantAvatar aria-label="Workspace assistant" />,
    );

    expect(
      screen.getByRole('img', { name: 'Workspace assistant' }),
    ).toBeVisible();
    expect(screen.getAllByRole('img')).toHaveLength(1);

    rerender(
      <>
        <span id="assistant-name">Custom assistant</span>
        <AssistantAvatar aria-labelledby="assistant-name" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Custom assistant' })).toBeVisible();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('forwards native attributes, the ref and caller styling to its span', () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <AssistantAvatar
        ref={ref}
        aria-label="Assistant"
        className="custom-avatar"
        title="Assistant details"
        data-workspace="acme"
        style={{ opacity: 0.5, marginInlineEnd: 8 }}
      />,
    );

    const avatar = screen.getByRole('img', { name: 'Assistant' });

    expect(ref.current).toBe(avatar);
    expect(avatar.tagName).toBe('SPAN');
    expect(avatar).toHaveClass('custom-avatar');
    expect(avatar).toHaveAttribute('title', 'Assistant details');
    expect(avatar).toHaveAttribute('data-workspace', 'acme');
    expect(avatar).toHaveStyle({ opacity: '0.5', marginInlineEnd: '8px' });
  });

  it('preserves explicit aria-hidden values for labeled artwork', () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(
      <AssistantAvatar ref={ref} aria-label="Assistant" aria-hidden />,
    );

    expect(ref.current).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(<AssistantAvatar aria-label="Assistant" aria-hidden={false} />);

    expect(screen.getByRole('img', { name: 'Assistant' })).toHaveAttribute(
      'aria-hidden',
      'false',
    );
  });

  it('updates the controlled character without adding remote image sources', () => {
    const { rerender, container } = render(
      <AssistantAvatar
        aria-label="Assistant"
        shape="cookie"
        face="wink"
        color="green"
        size={14}
      />,
    );
    const avatar = screen.getByRole('img', { name: 'Assistant' });

    expect(avatar).toHaveAttribute('data-shape', 'cookie');
    expect(avatar).toHaveAttribute('data-face', 'wink');
    expect(avatar).toHaveAttribute('data-color', 'green');
    expect(avatar).toHaveStyle({ width: '14px', height: '14px' });

    rerender(
      <AssistantAvatar
        aria-label="Assistant"
        shape="arch"
        face="love"
        color="pink"
        size={40}
      />,
    );

    expect(avatar).toHaveAttribute('data-shape', 'arch');
    expect(avatar).toHaveAttribute('data-face', 'love');
    expect(avatar).toHaveAttribute('data-color', 'pink');
    expect(avatar).toHaveStyle({ width: '40px', height: '40px' });
    expect(container.querySelector('[src], [href], [xlink\\:href]')).toBeNull();
    expect(container.innerHTML).not.toMatch(/https?:\/\//);
  });
});
