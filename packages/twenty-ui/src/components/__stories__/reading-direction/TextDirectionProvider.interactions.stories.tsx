import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DirectionalMenusExample } from './DirectionalMenusExample';

const meta: Meta<typeof DirectionalMenusExample> = {
  title: 'UI/Layout/TextDirectionProvider/Interactions',
  component: DirectionalMenusExample,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DirectionalMenusExample>;

export const LeftToRight: Story = {
  args: { direction: 'ltr' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const forwardKey =
      args.direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}';
    const backwardKey =
      args.direction === 'rtl' ? '{ArrowRight}' : '{ArrowLeft}';

    for (const family of ['Menu', 'Dropdown']) {
      const trigger = canvas.getByRole('button', {
        name: `Open ${family.toLowerCase()}`,
      });
      await userEvent.click(trigger);
      const popup = await body.findByRole('menu', {
        name: family === 'Menu' ? 'Open menu' : 'Record options',
      });
      expect(getComputedStyle(popup).direction).toBe(args.direction);
      expect(canvasElement.contains(popup)).toBe(args.scoped !== false);
      const submenuTrigger = within(popup).getByRole('menuitem', {
        name: `${family} export`,
      });
      submenuTrigger.focus();
      await userEvent.keyboard(forwardKey);
      const submenu = await body.findByRole('menu', {
        name: family === 'Menu' ? 'Menu export' : 'Dropdown export formats',
      });
      const item = within(submenu).getByRole('menuitem', {
        name: `${family} CSV`,
      });
      await waitFor(() => expect(item).toHaveFocus());
      expect(getComputedStyle(submenu).direction).toBe(args.direction);
      await waitFor(() => {
        const parentBox = submenuTrigger.getBoundingClientRect();
        const childBox = submenu.getBoundingClientRect();
        expect(
          args.direction === 'rtl'
            ? childBox.right <= parentBox.left + 2
            : childBox.left >= parentBox.right - 2,
        ).toBe(true);
      });
      await userEvent.keyboard(backwardKey);
      await waitFor(() => expect(submenuTrigger).toHaveFocus());
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(trigger).toHaveFocus());
      await userEvent.click(trigger);
      await userEvent.hover(
        await body.findByRole('menuitem', { name: `${family} export` }),
      );
      await userEvent.click(
        await body.findByRole('menuitem', { name: `${family} CSV` }),
      );
      await waitFor(() =>
        expect(
          body.queryByRole('menu', {
            name: family === 'Menu' ? 'Open menu' : 'Record options',
          }),
        ).not.toBeInTheDocument(),
      );
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open dropdown' }),
    );
    expect(getComputedStyle(body.getByTestId('header-icon')).transform).toBe(
      'none',
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Details page' }),
    );
    await userEvent.click(await body.findByRole('menuitem', { name: 'Back' }));
    expect(
      await body.findByRole('menuitem', { name: 'Details page' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    const tooltipTrigger = canvas.getByRole('button', {
      name: 'Tooltip target',
    });
    await userEvent.hover(tooltipTrigger);
    const tooltip = await body.findByRole('tooltip');
    expect(getComputedStyle(tooltip).direction).toBe(args.direction);
    expect(canvasElement.contains(tooltip)).toBe(args.scoped !== false);
    await userEvent.unhover(tooltipTrigger);
    await userEvent.keyboard('{Escape}');
  },
};

export const RightToLeft: Story = {
  ...LeftToRight,
  args: { direction: 'rtl' },
};
export const RightToLeftBodyPortal: Story = {
  ...LeftToRight,
  args: { direction: 'rtl', scoped: false },
};
