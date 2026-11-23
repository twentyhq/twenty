import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FormulaSqlColumn } from 'src/engine/metadata-modules/formula-field/types/formula-sql-column.type';

type FormulaSqlColumnSource = {
  name: string;
  type: FieldMetadataType;
  relationType?: RelationType;
};

export const buildFormulaSqlColumnsByPath = (
  fields: FormulaSqlColumnSource[],
): Map<string, FormulaSqlColumn> => {
  const formulaSqlColumnsByPath = new Map<string, FormulaSqlColumn>();

  for (const { name, type, relationType } of fields) {
    if (type === FieldMetadataType.MORPH_RELATION) {
      continue;
    }

    if (type === FieldMetadataType.RELATION) {
      if (relationType === RelationType.MANY_TO_ONE) {
        formulaSqlColumnsByPath.set(name, {
          columnName: computeMorphOrRelationFieldJoinColumnName({ name }),
          columnFieldMetadataType: type,
          fieldName: name,
        });
      }

      continue;
    }

    const compositeType = compositeTypeDefinitions.get(type);

    if (!isDefined(compositeType)) {
      formulaSqlColumnsByPath.set(name, {
        columnName: name,
        columnFieldMetadataType: type,
        fieldName: name,
      });

      continue;
    }

    for (const compositeProperty of compositeType.properties) {
      formulaSqlColumnsByPath.set(`${name}.${compositeProperty.name}`, {
        columnName: computeCompositeColumnName(name, compositeProperty),
        columnFieldMetadataType: compositeProperty.type,
        fieldName: name,
      });
    }
  }

  return formulaSqlColumnsByPath;
};
