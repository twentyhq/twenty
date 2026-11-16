import { isString } from '@sniptt/guards';
import { type FieldMetadataComputation } from 'twenty-shared/types';

// A kind's description names properties of its computation, which is not known to be of that kind here
export const getComputedFieldComputationTextProperty = ({
  computation,
  property,
}: {
  computation: FieldMetadataComputation;
  property: string;
}): string | undefined => {
  const properties: Record<string, unknown> = computation;
  const value = properties[property];

  return isString(value) ? value : undefined;
};
