import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { TabButton } from '../TabButton';
import styles from '../TabButton.module.scss';

runComponentConformance({
  name: 'TabButton',
  element: <TabButton>Overview</TabButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

runComponentConformance({
  name: 'TabButton link',
  element: <TabButton href="#overview">Overview</TabButton>,
  refInstanceOf: HTMLAnchorElement,
  ownClassName: styles.button,
  renderPropTagName: 'a',
});

describe('TabButton semantics and appearance', () => {
  it('keeps route links separate from panel tabs and forwards explicit current state', () => {
    render(
      <nav aria-label="Pages">
        <TabButton href="#overview" active aria-current="page">
          Overview
        </TabButton>
        <TabButton href="#settings" active>
          Settings
        </TabButton>
      </nav>,
    );

    const currentRoute = screen.getByRole('link', { name: 'Overview' });
    expect(currentRoute).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(currentRoute).not.toHaveAttribute('aria-controls');
    expect(currentRoute).not.toHaveAttribute('aria-selected');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('uses explicit child size before group size before its standalone default', () => {
    render(
      <>
        <TabButton>Standalone</TabButton>
        <ButtonGroup size="md" aria-label="Page actions">
          <TabButton>Inherited</TabButton>
          <TabButton size="sm">Explicit</TabButton>
        </ButtonGroup>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Standalone' })).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(screen.getByRole('button', { name: 'Inherited' })).toHaveAttribute(
      'data-size',
      'md',
    );
    expect(screen.getByRole('button', { name: 'Explicit' })).toHaveAttribute(
      'data-size',
      'sm',
    );
  });

  it('preserves explicit native button composition and actual refs', async () => {
    const user = userEvent.setup();
    const buttonRef = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <TabButton
        render={<button name="create" value="record" />}
        nativeButton
        ref={buttonRef}
        onClick={onClick}
      >
        Create
      </TabButton>,
    );

    const button = screen.getByRole('button', { name: 'Create' });
    expect(buttonRef.current).toBe(button);
    expect(button).toHaveAttribute('name', 'create');
    expect(button).toHaveAttribute('value', 'record');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button).not.toHaveAttribute('aria-selected');
    expect(button).not.toHaveAttribute('aria-controls');
  });

  it('composes callback-rendered anchors without inferring panel semantics', async () => {
    const user = userEvent.setup();
    const anchorRef = createRef<HTMLAnchorElement>();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <TabButton
        nativeButton={false}
        role="link"
        render={(props) => (
          <a {...props} href="#activity">
            {props.children}
          </a>
        )}
        ref={anchorRef}
        active
        aria-current="page"
        onClick={onClick}
      >
        Activity
      </TabButton>,
    );

    const link = screen.getByRole('link', { name: 'Activity' });
    expect(anchorRef.current).toBe(link);
    expect(link).toHaveAttribute('href', '#activity');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).not.toHaveAttribute('type');
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
