import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';

runComponentConformance({
  name: 'ListItem',
  element: <ListItem>Item</ListItem>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

describe('ListItem clicks', () => {
  it('consumes the click when the row owns an action', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    const onAction = vi.fn();

    render(
      <a href="#parent" onClick={onParentClick}>
        <ListItem onClick={onAction}>Archive</ListItem>
      </a>,
    );

    await user.click(screen.getByText('Archive'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('lets a row without an action activate its containing trigger', async () => {
    const user = userEvent.setup();
    const onTriggerClick = vi.fn();

    render(
      <a href="#parent" onClick={onTriggerClick}>
        <ListItem>Open menu</ListItem>
      </a>,
    );

    await user.click(screen.getByText('Open menu'));

    expect(onTriggerClick).toHaveBeenCalledTimes(1);
  });

  it('keeps disabled rows inactive without consuming the click', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    const onAction = vi.fn();

    render(
      <a href="#parent" onClick={onParentClick}>
        <ListItem disabled onClick={onAction}>
          Delete
        </ListItem>
      </a>,
    );

    await user.click(screen.getByText('Delete'));

    expect(onAction).not.toHaveBeenCalled();
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });
});

describe('ListItem content', () => {
  it('gives a text label a tooltip and leaves other content untouched', () => {
    render(
      <>
        <ListItem>Rename</ListItem>
        <ListItem>
          <span data-testid="custom-label">Custom</span>
        </ListItem>
      </>,
    );

    expect(screen.getByText('Rename')).toHaveAttribute(
      'data-testid',
      'tooltip',
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });
});
