import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Card } from '../Card';

import rootStyles from '../Card.module.scss';
import contentStyles from '../CardContent.module.scss';
import footerStyles from '../CardFooter.module.scss';
import headerStyles from '../CardHeader.module.scss';

for (const { name, Component, ownClassName } of [
  { name: 'Root', Component: Card.Root, ownClassName: rootStyles.card },
  {
    name: 'Header',
    Component: Card.Header,
    ownClassName: headerStyles.cardHeader,
  },
  {
    name: 'Content',
    Component: Card.Content,
    ownClassName: contentStyles.cardContent,
  },
  {
    name: 'Footer',
    Component: Card.Footer,
    ownClassName: footerStyles.cardFooter,
  },
]) {
  runComponentConformance({
    name: `Card.${name}`,
    element: <Component>Import summary</Component>,
    ownClassName,
    refInstanceOf: HTMLDivElement,
  });

  it(`composes Card.${name} with a native button's attributes, handlers and ref`, async () => {
    const user = userEvent.setup();
    const nativeRef = createRef<HTMLButtonElement>();
    const onCardClick = vi.fn();
    const onButtonClick = vi.fn();

    render(
      <Component
        aria-describedby="import-description"
        onClick={onCardClick}
        render={
          <button
            type="button"
            name="import"
            value="ready"
            ref={nativeRef}
            onClick={onButtonClick}
          />
        }
      >
        Import records
      </Component>,
    );

    const button = screen.getByRole('button', { name: 'Import records' });

    expect(nativeRef.current).toBe(button);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('name', 'import');
    expect(button).toHaveAttribute('value', 'ready');
    expect(button).toHaveAttribute('aria-describedby', 'import-description');

    await user.click(button);

    expect(onCardClick).toHaveBeenCalledTimes(1);
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
}

describe('Card rendering', () => {
  it('preserves the root appearance flags and merges a custom background with native styles', () => {
    render(
      <Card.Root
        fullWidth
        rounded
        backgroundColor="rebeccapurple"
        style={{ marginTop: 7 }}
      >
        Import summary
      </Card.Root>,
    );

    const root = screen.getByText('Import summary');

    expect(root).toHaveAttribute('data-full-width', 'true');
    expect(root).toHaveAttribute('data-rounded', 'true');
    expect(root).toHaveStyle({ marginTop: '7px' });
    expect(root.style.getPropertyValue('--card-background-color')).toBe(
      'rebeccapurple',
    );
  });

  it('keeps repeated sections in the supplied order and preserves divider defaults', () => {
    render(
      <Card.Root aria-label="Import summary" role="region">
        <Card.Header>Summary</Card.Header>
        <Card.Content divider>Ready records</Card.Content>
        <Card.Content>Records to review</Card.Content>
        <Card.Footer>Last checked</Card.Footer>
        <Card.Footer divider={false}>Import actions</Card.Footer>
      </Card.Root>,
    );

    const root = screen.getByRole('region', { name: 'Import summary' });

    expect([...root.children].map((child) => child.textContent)).toEqual([
      'Summary',
      'Ready records',
      'Records to review',
      'Last checked',
      'Import actions',
    ]);
    expect(root).not.toHaveAttribute('data-full-width');
    expect(root).not.toHaveAttribute('data-rounded');
    expect(screen.getByText('Ready records')).toHaveAttribute(
      'data-divider',
      'true',
    );
    expect(screen.getByText('Records to review')).not.toHaveAttribute(
      'data-divider',
    );
    expect(screen.getByText('Last checked')).not.toHaveAttribute(
      'data-no-divider',
    );
    expect(screen.getByText('Import actions')).toHaveAttribute(
      'data-no-divider',
      'true',
    );
  });

  it('keeps display cards presentational when they observe click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card.Root onClick={onClick}>
        <Card.Content>Import summary</Card.Content>
      </Card.Root>,
    );

    const content = screen.getByText('Import summary');
    const root = content.parentElement;

    expect(root?.localName).toBe('div');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await user.click(content);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
