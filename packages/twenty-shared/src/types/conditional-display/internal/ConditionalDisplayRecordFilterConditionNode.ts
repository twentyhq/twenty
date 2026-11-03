import { type ConditionalDisplayConditionNode } from '../ConditionalDisplayConditionNode';

export type ConditionalDisplayRecordFilterConditionNode = Extract<
  ConditionalDisplayConditionNode,
  { kind: 'recordFilter' }
>;
