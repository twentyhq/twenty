import { type ComponentProps } from 'react';

import { type CommandBlock } from '../src/components/data-display/CommandBlock/CommandBlock';

export const COMMAND_BLOCK_PROP_DESCRIPTIONS = {
  commands:
    'Command lines to display. The component prefixes each line with > and does not execute commands.',
  button:
    'Optional action element beside the command lines, such as a copy button.',
} satisfies Partial<Record<keyof ComponentProps<typeof CommandBlock>, string>>;
