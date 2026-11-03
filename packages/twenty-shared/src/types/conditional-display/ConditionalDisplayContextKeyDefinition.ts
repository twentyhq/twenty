import { type ConditionalDisplayContextKeySubject } from './internal/ConditionalDisplayContextKeySubject';
import { type ConditionalDisplaySurface } from './ConditionalDisplaySurface';

export type ConditionalDisplayContextKeyDefinition =
  | {
      owner: 'admin';
      subject: Extract<ConditionalDisplayContextKeySubject, { kind: 'value' }>;
    }
  | {
      owner: 'engine';
      surfaces: ConditionalDisplaySurface[];
      subject: ConditionalDisplayContextKeySubject;
    };
