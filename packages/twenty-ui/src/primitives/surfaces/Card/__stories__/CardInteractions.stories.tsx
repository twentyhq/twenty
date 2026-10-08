import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Card } from '../Card';

const SeparateCardControls = () => {
  const [imported, setImported] = useState(false);

  return (
    <Card.Root render={<article aria-label="Customer import" />}>
      <Card.Header>Customer import</Card.Header>
      <Card.Content
        render={<a href="#card-report" aria-label="Open the report" />}
      >
        Open the report
      </Card.Content>
      <Card.Footer>
        <Button type="button" onClick={() => setImported(true)}>
          {imported ? 'Customers imported' : 'Import customers'}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

const meta: Meta<typeof Card.Root> = {
  title: 'UI/Surfaces/Card/Interactions',
  component: Card.Root,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof Card.Root>;

export const ButtonOwner: Story = {
  render: (args) => (
    <Card.Root {...args} render={<button type="button" />}>
      <Card.Content render={<span />}>Review import</Card.Content>
    </Card.Root>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Review import',
    });

    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveStyle({
      cursor: 'pointer',
      display: 'block',
      outlineWidth: '2px',
      outlineStyle: 'solid',
    });
  },
};

export const LinkOwner: Story = {
  render: (args) => (
    <>
      <Card.Root
        {...args}
        render={
          <a
            href="about:blank#card-report"
            target="card-report-target"
            aria-label="Open the import report"
          />
        }
      >
        <Card.Header>Customer import</Card.Header>
        <Card.Content>Open the import report</Card.Content>
      </Card.Root>
      <iframe
        hidden
        name="card-report-target"
        title="Import report destination"
      />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Open the import report',
    });
    const destination = within(canvasElement).getByTitle<HTMLIFrameElement>(
      'Import report destination',
    );

    link.focus();
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(destination.contentWindow?.location.hash).toBe('#card-report'),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPrevented: false }),
    );
    await expect(link).toHaveAttribute('href', 'about:blank#card-report');
    await expect(link).toHaveAttribute('target', 'card-report-target');
    await expect(link).not.toHaveAttribute('role');
    await expect(link).toHaveStyle({ textDecorationLine: 'none' });
  },
};

export const DisabledOwner: Story = {
  render: (args) => (
    <>
      <Button type="button">Before import</Button>
      <Card.Root {...args} render={<button type="button" disabled />}>
        <Card.Content render={<span />}>Import unavailable</Card.Content>
      </Card.Root>
      <Button type="button">After import</Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledCard = canvas.getByRole('button', {
      name: 'Import unavailable',
    });

    canvas.getByRole('button', { name: 'Before import' }).focus();
    await userEvent.tab();

    await expect(
      canvas.getByRole('button', { name: 'After import' }),
    ).toHaveFocus();
    await expect(disabledCard).toBeDisabled();
    await expect(disabledCard).toHaveStyle({ cursor: 'not-allowed' });

    await userEvent.click(disabledCard);

    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const SeparateControls: Story = {
  render: () => <SeparateCardControls />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole('article', { name: 'Customer import' });
    const link = canvas.getByRole('link', { name: 'Open the report' });
    const action = canvas.getByRole('button', { name: 'Import customers' });

    link.focus();
    await userEvent.tab();
    await userEvent.keyboard(' ');

    await expect(action).toHaveFocus();
    await expect(action).toHaveAccessibleName('Customers imported');
    await expect(article).not.toHaveAttribute('tabindex');
    await expect(article).not.toHaveAttribute('role');
    await expect(link).not.toContainElement(action);
  },
};

export const NativePartsAndRefs: Story = {
  render: (args) => {
    const rootRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLHeadingElement>();
    const contentRef = createRef<HTMLElement>();
    const footerRef = createRef<HTMLElement>();

    return (
      <>
        <Card.Root {...args} ref={rootRef}>
          <Card.Header
            render={
              <h2 ref={headerRef} tabIndex={-1}>
                Customer import
              </h2>
            }
          />
          <Card.Content
            render={(props) => (
              <section
                {...props}
                ref={contentRef}
                aria-label="Import summary"
              />
            )}
            tabIndex={-1}
          >
            24 customers are ready.
          </Card.Content>
          <Card.Footer render={<footer ref={footerRef} />} tabIndex={-1}>
            Last checked just now.
          </Card.Footer>
        </Card.Root>
        <Button type="button" onClick={() => rootRef.current?.focus()}>
          Focus card
        </Button>
        <Button type="button" onClick={() => headerRef.current?.focus()}>
          Focus heading
        </Button>
        <Button type="button" onClick={() => contentRef.current?.focus()}>
          Focus summary
        </Button>
        <Button type="button" onClick={() => footerRef.current?.focus()}>
          Focus footer
        </Button>
      </>
    );
  },
  args: { tabIndex: -1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Focus card' }));
    await expect(canvas.getByRole('heading').parentElement).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus heading' }),
    );
    await expect(
      canvas.getByRole('heading', { name: 'Customer import' }),
    ).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus summary' }),
    );
    await expect(
      canvas.getByRole('region', { name: 'Import summary' }),
    ).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Focus footer' }));
    await expect(canvas.getByText('Last checked just now.')).toHaveFocus();
  },
};

export const HoverOwners: Story = {
  tags: ['!dev'],
  render: () => (
    <>
      {[
        <button type="button" aria-label="Review import" />,
        <a href="#card-report" aria-label="Open report" />,
        <button type="button" aria-label="Import unavailable" disabled />,
      ].map((owner) => (
        <Card.Root key={owner.props['aria-label']} render={owner}>
          <Card.Header render={<span />}>Customer import</Card.Header>
          <Card.Content render={<span />}>24 customers are ready.</Card.Content>
          <Card.Footer render={<span />}>Last checked just now.</Card.Footer>
        </Card.Root>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const sectionLabels = [
      'Customer import',
      '24 customers are ready.',
      'Last checked just now.',
    ];

    for (const owner of [
      canvas.getByRole('button', { name: 'Review import' }),
      canvas.getByRole('link', { name: 'Open report' }),
    ]) {
      await trustedUserEvent.hover(owner);

      await expect(owner).not.toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0)',
      });

      for (const sectionLabel of sectionLabels) {
        await expect(within(owner).getByText(sectionLabel)).toHaveStyle({
          backgroundColor: 'rgba(0, 0, 0, 0)',
        });
      }
    }

    const disabledOwner = canvas.getByRole('button', {
      name: 'Import unavailable',
    });

    await trustedUserEvent.hover(disabledOwner);

    await expect(disabledOwner).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
    });

    for (const sectionLabel of sectionLabels) {
      await expect(
        within(disabledOwner).getByText(sectionLabel),
      ).not.toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0)' });
    }
  },
};
