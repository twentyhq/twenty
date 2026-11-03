import { type ConditionalDisplayVirtualField } from '../ConditionalDisplayVirtualField';

export type ConditionalDisplayContextKeySubject =
  | { kind: 'value'; field: ConditionalDisplayVirtualField }
  | { kind: 'mapEntry'; entryField: ConditionalDisplayVirtualField }
  | {
      kind: 'property';
      propertyFields: Record<string, ConditionalDisplayVirtualField>;
    }
  | { kind: 'selectedRecordPath' };
