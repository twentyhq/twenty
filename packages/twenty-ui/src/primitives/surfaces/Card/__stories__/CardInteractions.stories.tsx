import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, createRef, useId, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Switch } from '@ui/primitives/input/Switch/Switch';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { Card } from '../Card';

const SeparateCardControls = ({
  onClick,
}: Pick<ComponentProps<typeof Card.Root>, 'onClick'>) => {
  const [imported, setImported] = useState(false);

  return (
    <Card.Root
      onClick={onClick}
      render={<article aria-label="Customer import" />}
    >
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
type ActionStory = StoryObj<typeof Card.Action>;

const nativePartClick = fn();

export const ButtonOwner: Story = {
  render: (args) => (
    <div style={{ width: '100%' }}>
      <Card.Root
        {...args}
        render={<button type="button" onClick={nativePartClick} />}
      >
        <Card.Content render={<span />}>Review import</Card.Content>
      </Card.Root>
      <Card.Header
        onClick={args.onClick}
        render={<button type="button" onClick={nativePartClick} />}
      >
        Review header
      </Card.Header>
      <Card.Content
        onClick={args.onClick}
        render={<button type="button" onClick={nativePartClick} />}
      >
        Review content
      </Card.Content>
      <Card.Footer
        onClick={args.onClick}
        render={<button type="button" onClick={nativePartClick} />}
      >
        Review footer
      </Card.Footer>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    let expectedActivations = 0;

    nativePartClick.mockClear();

    for (const name of [
      'Review import',
      'Review header',
      'Review content',
      'Review footer',
    ]) {
      const button = canvas.getByRole('button', { name });

      await userEvent.click(button);
      button.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');

      expectedActivations += 3;

      await expect(args.onClick).toHaveBeenCalledTimes(expectedActivations);
      await expect(nativePartClick).toHaveBeenCalledTimes(expectedActivations);
      await expect(button).toHaveFocus();
      await expect(button).toHaveAttribute('type', 'button');
      await expect(button).toHaveStyle({
        cursor: 'pointer',
        display: 'block',
        outlineWidth: '2px',
        outlineStyle: 'solid',
      });
    }
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
  render: (args) => <SeparateCardControls onClick={args.onClick} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole('article', { name: 'Customer import' });
    const link = canvas.getByRole('link', { name: 'Open the report' });
    const action = canvas.getByRole('button', { name: 'Import customers' });

    await userEvent.click(canvas.getByText('Customer import'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    link.focus();
    await userEvent.tab();
    await userEvent.keyboard(' ');

    await expect(action).toHaveFocus();
    await expect(action).toHaveAccessibleName('Customers imported');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
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

const independentControlClick = fn();

export const StretchedActions: ActionStory = {
  render: (args) => (
    <div style={{ width: '100%' }}>
      <Text>Outside stretched cards</Text>
      <Card.Root render={<article aria-label="Import cards" />}>
        <Card.Content render={<section aria-label="Import action area" />}>
          <Card.Action aria-label="Review customers" onClick={args.onClick} />
          <Text>24 customers are ready.</Text>
          <Card.Control render={<Button onClick={independentControlClick} />}>
            More options
          </Card.Control>
        </Card.Content>
        <Card.Content render={<section aria-label="Unavailable action area" />}>
          <Card.Action
            disabled
            render={<button aria-label="Unavailable review" />}
            onClick={args.onClick}
          />
          <Text>Review is unavailable.</Text>
        </Card.Content>
        <Card.Content render={<section aria-label="Static parent area" />}>
          <Card.Action aria-label="Parent review" onClick={args.onClick} />
          <Card.Control render={<Card.Root />}>
            <Card.Content render={<section aria-label="Nested action area" />}>
              <Card.Action aria-label="Nested review" onClick={args.onClick} />
              <Text>Nested customer import</Text>
            </Card.Content>
          </Card.Control>
        </Card.Content>
      </Card.Root>
    </div>
  ),
};

export const StretchedActionsInteractions: ActionStory = {
  ...StretchedActions,
  tags: ['!dev'],
  play: async ({ canvasElement, args }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Review customers' });
    const control = canvas.getByRole('button', { name: 'More options' });
    const actionArea = canvas.getByRole('region', {
      name: 'Import action area',
    });
    const disabledArea = canvas.getByRole('region', {
      name: 'Unavailable action area',
    });
    const staticArea = canvas.getByRole('region', {
      name: 'Static parent area',
    });
    const nestedArea = canvas.getByRole('region', {
      name: 'Nested action area',
    });
    const article = canvas.getByRole('article', { name: 'Import cards' });

    independentControlClick.mockClear();
    await trustedUserEvent.hover(canvas.getByText('Outside stretched cards'));

    const restingBackground = getComputedStyle(actionArea).backgroundColor;
    const disabledBackground = getComputedStyle(disabledArea).backgroundColor;
    const staticBackground = getComputedStyle(staticArea).backgroundColor;
    const articleBackground = getComputedStyle(article).backgroundColor;
    const nestedBackground = getComputedStyle(nestedArea).backgroundColor;

    await trustedUserEvent.hover(control);
    await expect(actionArea).not.toHaveStyle({
      backgroundColor: restingBackground,
    });
    await trustedUserEvent.click(control);
    await expect(independentControlClick).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(action).not.toContainElement(control);

    await trustedUserEvent.tab({ shift: true });
    await expect(action).toHaveFocus();
    await trustedUserEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(action).toHaveStyle({
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '-2px',
    });

    const disabledAction = canvas.getByRole('button', {
      name: 'Unavailable review',
    });
    await expect(disabledAction).toBeDisabled();
    disabledAction.focus();
    await expect(disabledAction).not.toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await trustedUserEvent.hover(canvas.getByText('Review is unavailable.'));
    await expect(disabledArea).toHaveStyle({
      backgroundColor: disabledBackground,
    });

    await trustedUserEvent.hover(
      canvas.getByRole('button', { name: 'Nested review' }),
    );
    await expect(nestedArea).not.toHaveStyle({
      backgroundColor: nestedBackground,
    });
    await expect(staticArea).toHaveStyle({ backgroundColor: staticBackground });
    await expect(article).toHaveStyle({ backgroundColor: articleBackground });
  },
};

export const StretchedLink: ActionStory = {
  render: (args) => (
    <div style={{ width: '100%' }}>
      <Card.Root>
        <Card.Content>
          <Card.Action
            aria-label="Open customer report"
            onClick={args.onClick}
            render={
              <a
                href="about:blank#stretched-report"
                aria-label="Open customer report"
                target="stretched-report-target"
              />
            }
          />
          <Text>Customer report</Text>
        </Card.Content>
      </Card.Root>
      <iframe
        hidden
        name="stretched-report-target"
        title="Stretched report destination"
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Open customer report' });
    const destination = canvas.getByTitle<HTMLIFrameElement>(
      'Stretched report destination',
    );

    link.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(destination.contentWindow?.location.hash).toBe(
        '#stretched-report',
      ),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPrevented: false }),
    );
    await expect(link).not.toHaveAttribute('role');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('target', 'stretched-report-target');
  },
};

const StretchedSwitchLabelExample = () => {
  const switchId = useId();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div style={{ width: '100%' }}>
      <Button>Before setting</Button>
      <Card.Root>
        <Card.Content render={<section aria-label="Recording preference" />}>
          <Card.Action
            render={<label htmlFor={switchId} aria-label="Record meetings" />}
          />
          <Text
            render={<label htmlFor={switchId} aria-label="Record meetings" />}
          >
            Record meetings
          </Text>
          <Card.Control>
            <Switch
              id={switchId}
              checked={isChecked}
              onCheckedChange={setIsChecked}
            />
          </Card.Control>
        </Card.Content>
      </Card.Root>
      <Button>After setting</Button>
    </div>
  );
};

export const StretchedControlLabel: Story = {
  tags: ['!dev'],
  render: () => <StretchedSwitchLabelExample />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Record meetings' });

    await trustedUserEvent.click(
      canvas.getByRole('region', { name: 'Recording preference' }),
    );
    await expect(control).toBeChecked();
    await trustedUserEvent.click(
      canvas.getByRole('button', { name: 'Before setting' }),
    );
    await trustedUserEvent.tab();
    await expect(control).toHaveFocus();
    await expect(control).toHaveStyle({
      outlineWidth: '2px',
      outlineStyle: 'solid',
    });
    await trustedUserEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
    await trustedUserEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'After setting' }),
    ).toHaveFocus();
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};
