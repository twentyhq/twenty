import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Card } from '../Card';

import rootStyles from '../Card.module.scss';
import actionStyles from '../CardAction.module.scss';
import controlStyles from '../CardControl.module.scss';
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

  it(`composes Card.${name} with a native button's attributes and ref`, () => {
    const nativeRef = createRef<HTMLButtonElement>();

    render(
      <Component
        aria-describedby="import-description"
        render={
          <button type="button" name="import" value="ready" ref={nativeRef} />
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
  });
}

runComponentConformance({
  name: 'Card.Action',
  element: <Card.Action>Review import</Card.Action>,
  ownClassName: actionStyles.action,
  refInstanceOf: HTMLButtonElement,
});

runComponentConformance({
  name: 'Card.Control',
  element: <Card.Control>Independent control</Card.Control>,
  ownClassName: controlStyles.control,
  refInstanceOf: HTMLSpanElement,
});

describe('Card rendering', () => {
  it('keeps native action and label contracts separate', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const composedButtonRef = createRef<HTMLButtonElement>();
    const labelRef = createRef<HTMLLabelElement>();

    render(
      <Card.Root>
        <Card.Content>
          <Card.Action aria-label="Review import" disabled ref={buttonRef} />
        </Card.Content>
        <Card.Content>
          <Card.Action
            disabled
            aria-label="Composed review"
            render={<button ref={composedButtonRef} />}
          />
        </Card.Content>
        <Card.Content>
          <Card.Action
            disabled
            render={
              <label
                htmlFor="record-meetings"
                aria-label="Record meetings"
                ref={labelRef}
              />
            }
          />
        </Card.Content>
      </Card.Root>,
    );

    expect(buttonRef.current).toHaveAttribute('type', 'button');
    expect(buttonRef.current).toBeDisabled();
    expect(composedButtonRef.current).toHaveAttribute('type', 'button');
    expect(composedButtonRef.current).toBeDisabled();
    expect(labelRef.current).toHaveAttribute('for', 'record-meetings');
    expect(labelRef.current).toHaveAttribute('data-disabled');
    expect(labelRef.current).not.toHaveAttribute('role');
    expect(labelRef.current).not.toHaveAttribute('tabindex');
    expect(labelRef.current).not.toHaveAttribute('type');
    expect(labelRef.current).not.toBeDisabled();
  });

  it('preserves the root appearance flags and merges a custom background with native styles', () => {
    render(
      <Card.Root
        fullWidth
        backgroundColor="rebeccapurple"
        style={{ marginTop: 7 }}
      >
        Import summary
      </Card.Root>,
    );

    const root = screen.getByText('Import summary');

    expect(root).toHaveAttribute('data-full-width', 'true');
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

  it('keeps display cards presentational with an onClick prop', () => {
    render(
      <Card.Root onClick={() => undefined}>
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
  });
});
