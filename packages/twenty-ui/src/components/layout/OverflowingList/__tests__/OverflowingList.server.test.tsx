import { act, within } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

import { OverflowingList } from '../OverflowingList';

it('renders capped inline content on the server and hydrates existing items without warnings', async () => {
  const content = (
    <OverflowingList maxInlineCount={1} showOverflowCount>
      {['First item', 'Second item', 'Third item'].map((label) => (
        <button key={label} type="button">
          {label}
        </button>
      ))}
    </OverflowingList>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(content);
  document.body.append(container);
  const serverItem = within(container).getByRole('button', {
    name: 'First item',
  });
  expect(serverItem).toBeVisible();
  expect(within(container).queryByText('Second item')).not.toBeInTheDocument();

  const onRecoverableError = vi.fn();
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  let root: Root | undefined;

  try {
    await act(async () => {
      root = hydrateRoot(container, content, { onRecoverableError });
    });
    expect(within(container).getByRole('button', { name: 'First item' })).toBe(
      serverItem,
    );
    expect(within(container).getAllByText('First item')).toHaveLength(1);
    expect(
      within(container).queryByText('Second item'),
    ).not.toBeInTheDocument();
    expect(within(container).queryByText('Third item')).not.toBeInTheDocument();
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    consoleError.mockRestore();
    container.remove();
  }
});
