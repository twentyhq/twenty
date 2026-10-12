import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { MenuPartsExample } from './MenuPartsExample';

const meta: Meta<typeof MenuPartsExample> = {
  title: 'UI/Surfaces/Menu/Parts',
  component: MenuPartsExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320, height: 320 } },
};

export default meta;
type Story = StoryObj<typeof MenuPartsExample>;

export const Documentation: Story = {};

export const Composition: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const firstTrigger = canvas.getByRole('button', { name: 'First record' });
    const secondTrigger = canvas.getByRole('button', { name: 'Second record' });

    await userEvent.click(firstTrigger);
    const menu = await body.findByRole('menu', { name: 'First record' });
    const popup = within(menu);
    await waitFor(() =>
      expect(popup.getByRole('group', { name: 'First record' })).toBeVisible(),
    );
    expect(body.getByTestId('menu-backdrop')).toHaveAttribute('data-open');
    expect(popup.getByTestId('menu-arrow')).toHaveAttribute('data-side');
    expect(popup.getByTestId('menu-viewport')).toBeVisible();
    expect(popup.getByRole('menuitem', { name: 'Open record' }).tagName).toBe(
      'A',
    );
    expect(
      popup.getByRole('menuitem', { name: 'Open record' }),
    ).toHaveAttribute('href', '#menu-record');

    expect(popup.getByTestId('checkbox-indicator')).toBeVisible();
    await userEvent.click(
      popup.getByRole('menuitemcheckbox', { name: /Notifications/ }),
    );
    await waitFor(() =>
      expect(popup.queryByTestId('checkbox-indicator')).not.toBeInTheDocument(),
    );
    expect(popup.getByTestId('list-indicator')).toBeVisible();
    await userEvent.click(
      popup.getByRole('menuitemradio', { name: 'Board view' }),
    );
    await waitFor(() =>
      expect(popup.queryByTestId('list-indicator')).not.toBeInTheDocument(),
    );
    expect(popup.getByTestId('board-indicator')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(firstTrigger).toHaveFocus();
    await userEvent.click(secondTrigger);
    const secondMenu = await body.findByRole('menu', { name: 'Second record' });
    await waitFor(() =>
      expect(
        within(secondMenu).getByRole('group', { name: 'Second record' }),
      ).toBeVisible(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(secondTrigger).toHaveFocus();
  },
};
