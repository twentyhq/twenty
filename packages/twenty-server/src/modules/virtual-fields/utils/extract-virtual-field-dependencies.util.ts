import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type AllStandardFieldIds } from 'src/modules/virtual-fields/types/AllStandardFieldIds';
import {
    type Condition,
    type VirtualField,
} from 'src/modules/virtual-fields/types/VirtualField';
import { resolveField } from 'src/modules/virtual-fields/utils/metadata-resolver.util';

export function extractVirtualFieldDependencies(
  virtualField: VirtualField,
  objectMetadataMaps: ObjectMetadataMaps,
): string[] {
  const dependencies = new Set<string>();

  const sourceObjectName = getObjectNameFromMetadataId(
    virtualField.objectMetadataId,
    objectMetadataMaps,
  );

  if (sourceObjectName) {
    dependencies.add(sourceObjectName);
  }

  if ('path' in virtualField) {
    const pathDependencies = extractPathDependencies(
      virtualField.path,
      objectMetadataMaps,
    );

    pathDependencies.forEach((dep) => dependencies.add(dep));
  }

  if ('where' in virtualField && virtualField.where) {
    const whereDependencies = extractConditionDependencies(
      virtualField.where,
      objectMetadataMaps,
    );

    whereDependencies.forEach((dep) => dependencies.add(dep));
  }

  if ('when' in virtualField) {
    for (const whenClause of virtualField.when) {
      const conditionDependencies = extractConditionDependencies(
        whenClause.condition,
        objectMetadataMaps,
      );

      conditionDependencies.forEach((dep) => dependencies.add(dep));
    }
  }

  return Array.from(dependencies);
}

function extractPathDependencies(
  path: AllStandardFieldIds[],
  objectMetadataMaps: ObjectMetadataMaps,
): string[] {
  const resolvedPath = path
    .map((fieldId) => resolveField(fieldId, objectMetadataMaps))
    .filter(Boolean);

  if (resolvedPath.length !== path.length) {
    return [];
  }

  return resolvedPath.map((step) => step!.objectName);
}

function extractConditionDependencies(
  condition: Condition,
  objectMetadataMaps: ObjectMetadataMaps,
): string[] {
  const dependencies = new Set<string>();

  if ('field' in condition) {
    const resolvedField = resolveField(condition.field, objectMetadataMaps);

    if (resolvedField) {
      dependencies.add(resolvedField.objectName);
    }
  } else if ('and' in condition || 'or' in condition || 'not' in condition) {
    if (condition.and) {
      for (const subCondition of condition.and) {
        const subDependencies = extractConditionDependencies(
          subCondition,
          objectMetadataMaps,
        );

        subDependencies.forEach((dep) => dependencies.add(dep));
      }
    }
    if (condition.or) {
      for (const subCondition of condition.or) {
        const subDependencies = extractConditionDependencies(
          subCondition,
          objectMetadataMaps,
        );

        subDependencies.forEach((dep) => dependencies.add(dep));
      }
    }
    if (condition.not) {
      const subDependencies = extractConditionDependencies(
        condition.not,
        objectMetadataMaps,
      );

      subDependencies.forEach((dep) => dependencies.add(dep));
    }
  }

  return Array.from(dependencies);
}

function getObjectNameFromMetadataId(
  objectMetadataId: string,
  objectMetadataMaps: ObjectMetadataMaps,
): string | null {
  const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

  if (!objectMetadata) {
    const objectByStandardId = Object.values(objectMetadataMaps.byId).find(
      (obj) => obj?.standardId === objectMetadataId,
    );

    if (objectByStandardId) {
      return objectByStandardId.nameSingular;
    }
  }

  return objectMetadata?.nameSingular ?? null;
}
