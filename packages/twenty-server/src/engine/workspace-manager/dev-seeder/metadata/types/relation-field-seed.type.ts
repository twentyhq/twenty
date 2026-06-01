import { type RelationType } from 'twenty-shared/types';

export type RelationFieldSeed = {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  relationType: RelationType;
  targetFieldLabel: string;
  targetFieldIcon: string;
};
