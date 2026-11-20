import { type MessageDescriptor } from '@lingui/core';

export type ProgramStepVisual =
  | { kind: 'form' }
  | { kind: 'ticket'; label: MessageDescriptor; value: string }
  | {
      kind: 'earning';
      figure: MessageDescriptor;
      caption: MessageDescriptor;
      trend: 'rising' | 'level';
    }
  | { kind: 'discord' };

export type ProgramStep = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  visual: ProgramStepVisual;
};
