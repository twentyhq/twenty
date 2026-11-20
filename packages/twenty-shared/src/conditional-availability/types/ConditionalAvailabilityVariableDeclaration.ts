import { type ConditionalAvailabilityContextByMetadataName } from './ConditionalAvailabilityContextByMetadataName';
import { type ConditionalAvailabilityMetadataName } from './ConditionalAvailabilityMetadataName';

export type ConditionalAvailabilityVariableDeclaration = {
  [TMetadataName in ConditionalAvailabilityMetadataName]: {
    [
      TVariableName in keyof ConditionalAvailabilityContextByMetadataName[TMetadataName]
    ]-?: true;
  };
};
