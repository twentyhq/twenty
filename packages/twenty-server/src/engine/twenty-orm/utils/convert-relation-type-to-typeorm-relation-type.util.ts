import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export const converRelationTypeToTypeORMRelationType = (type: RelationType) => {
  switch (type) {
    case RelationType.ONE_TO_MANY:
      return 'one-to-many';
    case RelationType.MANY_TO_ONE:
      return 'many-to-one';
    default:
      throw new Error(`Invalid relation type: ${type}`);
  }
};
