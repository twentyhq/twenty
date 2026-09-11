import { type MetadataReadability } from '@/types/MetadataReadability';

export enum ObjectAccessInheritanceMatch {
  ANY = 'ANY',
  ALL = 'ALL',
}

export enum ObjectAccessInheritanceRelationKind {
  FIELD = 'FIELD',
  MORPH = 'MORPH',
}

// A logical reference to one outgoing to-one relation of the child object:
// an ordinary relation is identified by its field universal identifier, a morph
// relation by its morph id, which names the whole logical group at once so a new
// morph variant needs no second list to maintain
export type ObjectAccessInheritanceRelationRef =
  | {
      kind: ObjectAccessInheritanceRelationKind.FIELD;
      fieldUniversalIdentifier: string;
    }
  | {
      kind: ObjectAccessInheritanceRelationKind.MORPH;
      morphId: string;
    };

export type ObjectAccessInheritance = {
  through: [
    ObjectAccessInheritanceRelationRef,
    ...ObjectAccessInheritanceRelationRef[],
  ];
  match: ObjectAccessInheritanceMatch;
};

export type ObjectAccess =
  | {
      readability: Exclude<MetadataReadability, MetadataReadability.INHERITED>;
      inheritance?: never;
    }
  | {
      readability: MetadataReadability.INHERITED;
      inheritance: ObjectAccessInheritance;
    };
