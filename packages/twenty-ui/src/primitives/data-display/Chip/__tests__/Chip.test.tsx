import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Chip } from '../Chip';
import styles from '../Chip.module.scss';

runComponentConformance({
  name: 'Chip',
  element: <Chip>Label</Chip>,
  ownClassName: styles.chip,
  refInstanceOf: HTMLDivElement,
});

describe('Chip content and composition', () => {
  it('keeps the default element when a click handler is supplied', () => {
    render(
      <Chip onClick={vi.fn()} data-testid="chip">
        Label
      </Chip>,
    );

    expect(screen.getByTestId('chip').tagName).toBe('DIV');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('chip')).not.toHaveAttribute('tabindex');
  });

  it('adds no label for omitted, empty or boolean content', () => {
    render(
      <>
        <Chip data-testid="empty-chip" />
        <Chip data-testid="empty-chip">{null}</Chip>
        <Chip data-testid="empty-chip">{false}</Chip>
        <Chip data-testid="empty-chip">{true}</Chip>
        <Chip data-testid="empty-chip">{''}</Chip>
      </>,
    );

    for (const chip of screen.getAllByTestId('empty-chip')) {
      expect(chip).toBeEmptyDOMElement();
    }
    expect(screen.queryByText('Untitled')).not.toBeInTheDocument();
  });

  it('preserves caller fallbacks, zero, rich content and both slots', () => {
    render(
      <>
        <Chip>Caller fallback</Chip>
        <Chip>{0}</Chip>
        <Chip
          startElement={<span>Start</span>}
          endElement={<span>End</span>}
          endElementDivider
        >
          <strong>Rich content</strong>
        </Chip>
      </>,
    );

    expect(screen.getByText('Caller fallback')).toBeVisible();
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('Start')).toBeVisible();
    expect(screen.getByText('Rich content').tagName).toBe('STRONG');
    expect(screen.getByText('End')).toBeVisible();
  });

  it('targets the explicit link with native props and a DOM ref without linkifying its text', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Chip
        ref={ref}
        render={
          <a
            href="https://twenty.com"
            target="_blank"
            aria-label="Open Twenty"
          />
        }
        aria-label="Open Twenty"
        title="Documentation"
        data-owner="caller"
      >
        https://twenty.com
      </Chip>,
    );

    const link = screen.getByRole('link', { name: 'Open Twenty' });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('href', 'https://twenty.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('title', 'Documentation');
    expect(link).toHaveAttribute('data-owner', 'caller');
    expect(link.querySelector('a')).toBeNull();
  });

  it('renders intentional links supplied as content once', () => {
    render(
      <Chip>
        <a href="https://twenty.com">Documentation</a>
      </Chip>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      'https://twenty.com',
    );
  });
});
