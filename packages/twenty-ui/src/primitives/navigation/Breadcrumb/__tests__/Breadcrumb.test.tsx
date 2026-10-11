import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ComponentPropsWithRef, type MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Breadcrumb } from '../Breadcrumb';
import styles from '../Breadcrumb.module.scss';

runComponentConformance({
  name: 'Breadcrumb',
  element: <Breadcrumb links={[{ children: 'Workspace' }]} />,
  ownClassName: styles.root,
  refInstanceOf: HTMLElement,
});

const RoutingLink = ({
  to,
  children,
  ...props
}: ComponentPropsWithRef<'a'> & { to: string }) => (
  <a {...props} href={to}>
    {children}
  </a>
);

describe('Breadcrumb items', () => {
  it('preserves native anchor attributes, styling and cancellable events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const item = {
      children: 'Export',
      href: '#export',
      target: '_blank',
      rel: 'noopener noreferrer',
      download: 'records.csv',
      hrefLang: 'en',
      referrerPolicy: 'no-referrer' as const,
      'data-destination': 'export',
      className: 'consumer-link',
      style: { marginLeft: '7px' },
      onFocus,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        onClick(event.currentTarget, event.defaultPrevented);
        event.preventDefault();
      },
    };

    render(<Breadcrumb links={[item]} />);

    const link = screen.getByRole('link', { name: 'Export' });

    expect(link).toHaveAttribute('href', '#export');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('download', 'records.csv');
    expect(link).toHaveAttribute('hreflang', 'en');
    expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(link).toHaveAttribute('data-destination', 'export');
    expect(link).toHaveClass(styles.content, 'consumer-link');
    expect(link).toHaveStyle({ marginLeft: '7px' });

    await user.tab();
    expect(link).toHaveFocus();
    expect(onFocus).toHaveBeenCalledOnce();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledExactlyOnceWith(link, false);
  });

  it('keeps default current-page and decorative separator semantics', () => {
    render(
      <Breadcrumb
        aria-label="Record path"
        links={[
          { children: 'Workspace', href: '/workspace' },
          { children: 'Company' },
        ]}
      />,
    );

    const navigation = screen.getByRole('navigation', { name: 'Record path' });

    expect(within(navigation).getAllByRole('listitem')).toHaveLength(2);
    expect(within(navigation).getByRole('link')).not.toHaveAttribute(
      'aria-current',
    );
    expect(within(navigation).getByText('Company')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(navigation).getByText('/')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('respects explicit current-page attributes and linked current items', () => {
    const { rerender } = render(
      <Breadcrumb
        links={[
          { children: 'Workspace', href: '#workspace', 'aria-current': 'page' },
          { children: 'Company', href: '#company', 'aria-current': false },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Company' })).toHaveAttribute(
      'aria-current',
      'false',
    );

    rerender(
      <Breadcrumb
        links={[
          { children: 'Workspace', href: '#workspace' },
          { children: 'Company', href: '#company', 'aria-current': 'location' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Company' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  it('merges routing element props, handlers and DOM refs', async () => {
    const user = userEvent.setup();
    const itemRef = createRef<HTMLAnchorElement>();
    const routingRef = createRef<HTMLAnchorElement>();
    const onItemClick = vi.fn();
    const onRoutingClick = vi.fn();
    const { unmount } = render(
      <Breadcrumb
        links={[
          {
            children: 'Companies',
            href: '#companies',
            ref: itemRef,
            onClick: onItemClick,
            className: 'item-link',
            render: (
              <RoutingLink
                to="#companies"
                ref={routingRef}
                className="router-link"
                data-router="true"
                onClick={onRoutingClick}
              />
            ),
          },
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'Companies' });

    expect(link).toHaveAttribute('href', '#companies');
    expect(link).toHaveAttribute('data-router', 'true');
    expect(link).toHaveClass(styles.content, 'item-link', 'router-link');
    expect(itemRef.current).toBe(link);
    expect(routingRef.current).toBe(link);
    await user.click(link);
    expect(onItemClick).toHaveBeenCalledOnce();
    expect(onRoutingClick).toHaveBeenCalledOnce();

    unmount();
    expect(itemRef.current).toBeNull();
    expect(routingRef.current).toBeNull();
  });

  it('passes native props and cleanup refs through a routing render function', () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    const { unmount } = render(
      <Breadcrumb
        links={[
          {
            children: 'Settings',
            href: '#settings',
            target: '_blank',
            ref,
            render: ({ href, ...props }) => (
              <RoutingLink {...props} to={href ?? '#fallback'} />
            ),
          },
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('href', '#settings');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(ref).toHaveBeenCalledWith(link);
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('exposes the actual DOM ref for a static current item', () => {
    const ref = createRef<HTMLSpanElement>();
    const { unmount } = render(
      <Breadcrumb links={[{ children: 'Company', ref }]} />,
    );

    expect(ref.current).toBe(screen.getByText('Company'));
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    unmount();
    expect(ref.current).toBeNull();
  });

  it('preserves caller-owned nodes and meaningful title overrides', () => {
    render(
      <Breadcrumb
        links={[
          { children: 'Workspace', href: '#workspace', title: '' },
          { children: <strong>Company</strong>, title: 'Company record' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
      'title',
      '',
    );
    expect(screen.getByText('Company').tagName).toBe('STRONG');
    expect(screen.getByText('Company').parentElement).toHaveAttribute(
      'title',
      'Company record',
    );
  });
});
