import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  Button,
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '../Button/Button';
import { ButtonGroup } from '../ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Input/Button/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
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
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
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
