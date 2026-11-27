import {
  type FieldMetadataFormula,
  type FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  isDefined,
  isQueryTimeFormulaFieldMetadata,
} from 'twenty-shared/utils';

type FormulaFieldDescriptorSource = {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  formula: Partial<
    Pick<FieldMetadataFormula, 'expression' | 'evaluation'>
  > | null;
};

type FormulaFieldDescriptorSourceReader<
  TFlatFieldMetadata extends FormulaFieldDescriptorSource,
> = {
  getSettings: (flatFieldMetadata: TFlatFieldMetadata) => object | null;
  findRelationTargetFlatFieldMetadatas: (
    flatFieldMetadata: TFlatFieldMetadata,
  ) => TFlatFieldMetadata[];
};

const toScalarFieldDescriptor = ({
  name,
  type,
  universalIdentifier,
}: FormulaFieldDescriptorSource): ValidationRuleFieldDescriptor => ({
  name,
  type,
  universalIdentifier,
});

// A formula reads stored values only, so query-time formulas are left out on both sides of a relation
export const buildFormulaFieldDescriptors = <
  TFlatFieldMetadata extends FormulaFieldDescriptorSource,
>({
  flatFieldMetadatas,
  getSettings,
  findRelationTargetFlatFieldMetadatas,
}: {
  flatFieldMetadatas: TFlatFieldMetadata[];
} & FormulaFieldDescriptorSourceReader<TFlatFieldMetadata>): ValidationRuleFieldDescriptor[] => {
  const isStored = (flatFieldMetadata: TFlatFieldMetadata) =>
    !isQueryTimeFormulaFieldMetadata(flatFieldMetadata);

  return flatFieldMetadatas.filter(isStored).map((flatFieldMetadata) => {
    const settings = getSettings(flatFieldMetadata);
    const relationType =
      isDefined(settings) && 'relationType' in settings
        ? settings.relationType
        : undefined;

    if (
      relationType !== RelationType.MANY_TO_ONE &&
      relationType !== RelationType.ONE_TO_MANY
    ) {
      return toScalarFieldDescriptor(flatFieldMetadata);
    }

    return {
      ...toScalarFieldDescriptor(flatFieldMetadata),
      relationType,
      relationTargetFields: findRelationTargetFlatFieldMetadatas(
        flatFieldMetadata,
      )
        .filter(isStored)
        .map(toScalarFieldDescriptor),
    };
  });
};
