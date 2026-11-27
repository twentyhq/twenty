import {
  type FieldMetadataFormula,
  type FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  isDefined,
  isFormulaFieldMetadata,
  isQueryTimeFormulaFieldMetadata,
} from 'twenty-shared/utils';

type FormulaFieldDescriptorSource = {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  formula: Partial<
    Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree' | 'evaluation'>
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
  formula,
}: FormulaFieldDescriptorSource): ValidationRuleFieldDescriptor => ({
  name,
  type,
  universalIdentifier,
  ...(isDefined(formula) &&
  isFormulaFieldMetadata({ formula }) &&
  isQueryTimeFormulaFieldMetadata({ formula })
    ? { queryTimeFormula: formula }
    : {}),
});

export const buildFormulaFieldDescriptors = <
  TFlatFieldMetadata extends FormulaFieldDescriptorSource,
>({
  flatFieldMetadatas,
  getSettings,
  findRelationTargetFlatFieldMetadatas,
}: {
  flatFieldMetadatas: TFlatFieldMetadata[];
} & FormulaFieldDescriptorSourceReader<TFlatFieldMetadata>): ValidationRuleFieldDescriptor[] =>
  flatFieldMetadatas.map((flatFieldMetadata) => {
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
      ).map(toScalarFieldDescriptor),
    };
  });
