import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { Button } from '@ui/primitives/input/Button/Button';
import type { ButtonAccent } from '@ui/primitives/input/Button/types/ButtonAccent';
import type { ButtonSize } from '@ui/primitives/input/Button/types/ButtonSize';
import type { ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Input/Button/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    size: 'small',
    variant: 'primary',
    accent: 'danger',
    children: [
      <Button key="note" Icon={IconNotes} title="Note" />,
      <Button key="task" Icon={IconCheckbox} title="Task" />,
      <Button key="activity" Icon={IconTimelineEvent} title="Activity" />,
    ],
  },
  argTypes: {
    children: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof ButtonGroup> = {
  args: {
    children: [
      <Button key="note" Icon={IconNotes} title="Note" />,
      <Button key="task" Icon={IconCheckbox} title="Task" />,
      <Button key="activity" Icon={IconTimelineEvent} title="Activity" />,
    ],
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    children: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies ButtonAccent[],
          props: (accent: ButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
