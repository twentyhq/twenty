import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { LightButton } from '../LightButton';
import { type LightButtonProps } from '../types/LightButtonProps';

const meta: Meta<typeof LightButton> = {
  title: 'UI/Components/LightButton',
  component: LightButton,
  args: { children: 'Add filter' },
};

export default meta;
type Story = StoryObj<typeof LightButton>;

export const Default: Story = { decorators: [ComponentDecorator] };

export const Emphasis: Story = {
  ...Default,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <>
      <LightButton>Standard action</LightButton>
      <LightButton emphasis="subtle">Subtle action</LightButton>
      <Button variant="ghost">Reference action</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole('button', { name: 'Standard action' });
    const subtle = canvas.getByRole('button', { name: 'Subtle action' });
    const reference = canvas.getByRole('button', { name: 'Reference action' });

    await expect(getComputedStyle(standard).fontWeight).toBe('400');
    await expect(getComputedStyle(subtle).fontWeight).toBe('400');
    await expect(standard.getBoundingClientRect().height).toBe(24);
    await expect(getComputedStyle(standard).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
    await expect(getComputedStyle(standard).color).toBe(
      getComputedStyle(reference).color,
    );
    await expect(getComputedStyle(subtle).color).not.toBe(
      getComputedStyle(standard).color,
    );
  },
};

export const SemanticAndGroupAppearance: Story = {
  ...Default,
  render: () => (
    <>
      <LightButton emphasis="subtle" color="danger">
        Delete record
      </LightButton>
      <Button variant="ghost" color="danger">
        Danger reference
      </Button>
      <LightButton emphasis="subtle" variant="solid">
        Solid action
      </LightButton>
      <Button variant="solid">Solid reference</Button>
      <ButtonGroup
        aria-label="Shared appearance"
        color="accent"
        variant="outline"
        size="md"
      >
        <LightButton emphasis="subtle" color="danger">
          Group action
        </LightButton>
        <Button>Group reference</Button>
      </ButtonGroup>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [actionName, referenceName] of [
      ['Delete record', 'Danger reference'],
      ['Solid action', 'Solid reference'],
      ['Group action', 'Group reference'],
    ]) {
      const action = canvas.getByRole('button', { name: actionName });
      const reference = canvas.getByRole('button', { name: referenceName });
      await expect(getComputedStyle(action).color).toBe(
        getComputedStyle(reference).color,
      );
      await expect(getComputedStyle(action).backgroundColor).toBe(
        getComputedStyle(reference).backgroundColor,
      );
    }
    await expect(
      canvas
        .getByRole('button', { name: 'Group action' })
        .getBoundingClientRect().height,
    ).toBe(32);
  },
};

const CATALOG_STATES: Record<string, Partial<LightButtonProps>> = {
  default: {},
  medium: { size: 'md' },
  disabled: { disabled: true },
  loading: { loading: true },
};

export const Catalog: CatalogStory<Story, typeof LightButton> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state] ?? {},
        },
        {
          name: 'emphasis',
          values: ['standard', 'subtle'],
          props: (emphasis: LightButtonProps['emphasis']) => ({ emphasis }),
        },
      ],
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof LightButton> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
