import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { RelationMetadataInterface } from 'src/metadata/field-metadata/interfaces/relation-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/workspace/utils/deduce-relation-direction.util';

describe('deduceRelationDirection', () => {
  it('should return FROM when the current object Metadata ID matches fromObjectMetadataId', () => {
    const fieldMetadata: FieldMetadataInterface = {
      id: 'field_id',
      objectMetadataId: 'from_object_id',
      type: FieldMetadataType.RELATION,
      name: 'field_name',
      label: 'Field Name',
      description: 'Field Description',
      targetColumnMap: {
        default: 'default_column',
      },
    };

    const relationMetadata = {
      id: 'relation_id',
      fromObjectMetadataId: fieldMetadata.objectMetadataId,
      toObjectMetadataId: 'to_object_id',
      fromFieldMetadataId: 'from_field_id',
      toFieldMetadataId: 'to_field_id',
      relationType: RelationMetadataType.ONE_TO_ONE,
    };

    const result = deduceRelationDirection(
      fieldMetadata,
      relationMetadata as RelationMetadataInterface,
    );

    expect(result).toBe(RelationDirection.FROM);
  });

  it('should return TO when the current object Metadata ID matches toObjectMetadataId', () => {
    // Arrange
    const fieldMetadata: FieldMetadataInterface = {
      id: 'field_id',
      objectMetadataId: 'to_object_id',
      type: FieldMetadataType.RELATION,
      name: 'field_name',
      label: 'Field Name',
      description: 'Field Description',
      targetColumnMap: {
        default: 'default_column',
      },
    };

    const relationMetadata = {
      id: 'relation_id',
      fromObjectMetadataId: 'from_object_id',
      toObjectMetadataId: fieldMetadata.objectMetadataId,
      fromFieldMetadataId: 'from_field_id',
      toFieldMetadataId: 'to_field_id',
      relationType: RelationMetadataType.ONE_TO_ONE,
    };

    const result = deduceRelationDirection(
      fieldMetadata,
      relationMetadata as RelationMetadataInterface,
    );

    expect(result).toBe(RelationDirection.TO);
  });

  it('when relation between same objects, when object field id matches relation from field id, should return FROM', () => {
    // Arrange
    const fieldMetadata: FieldMetadataInterface = {
      id: 'from_field_id',
      objectMetadataId: 'object_id',
      type: FieldMetadataType.RELATION,
      name: 'field_name',
      label: 'Field Name',
      description: 'Field Description',
      targetColumnMap: {
        default: 'default_column',
      },
    };

    const relationMetadata = {
      id: 'relation_id',
      fromObjectMetadataId: fieldMetadata.objectMetadataId,
      toObjectMetadataId: fieldMetadata.objectMetadataId,
      fromFieldMetadataId: fieldMetadata.id,
      toFieldMetadataId: 'to_field_id',
      relationType: RelationMetadataType.ONE_TO_ONE,
    };

    const result = deduceRelationDirection(
      fieldMetadata,
      relationMetadata as RelationMetadataInterface,
    );

    expect(result).toBe(RelationDirection.FROM);
  });

  it('when relation between same objects, when object field id matches relation to field id, should return TO', () => {
    // Arrange
    const fieldMetadata: FieldMetadataInterface = {
      id: 'to_field_id',
      objectMetadataId: 'object_id',
      type: FieldMetadataType.RELATION,
      name: 'field_name',
      label: 'Field Name',
      description: 'Field Description',
      targetColumnMap: {
        default: 'default_column',
      },
    };

    const relationMetadata = {
      id: 'relation_id',
      fromObjectMetadataId: fieldMetadata.objectMetadataId,
      toObjectMetadataId: fieldMetadata.objectMetadataId,
      fromFieldMetadataId: 'from_field_id',
      toFieldMetadataId: fieldMetadata.id,
      relationType: RelationMetadataType.ONE_TO_ONE,
    };

    const result = deduceRelationDirection(
      fieldMetadata,
      relationMetadata as RelationMetadataInterface,
    );

    expect(result).toBe(RelationDirection.TO);
  });

  it('should throw an error when the current object Metadata ID does not match any object metadata ID', () => {
    const fieldMetadata: FieldMetadataInterface = {
      id: 'field_id',
      objectMetadataId: 'unrelated_object_id',
      type: FieldMetadataType.RELATION,
      name: 'field_name',
      label: 'Field Name',
      description: 'Field Description',
      targetColumnMap: {
        default: 'default_column',
      },
    };

    const relationMetadata = {
      id: 'relation_id',
      fromObjectMetadataId: 'from_object_id',
      toObjectMetadataId: 'to_object_id',
      fromFieldMetadataId: 'from_field_id',
      toFieldMetadataId: 'to_field_id',
      relationType: RelationMetadataType.ONE_TO_ONE,
    };

    expect(() =>
      deduceRelationDirection(
        fieldMetadata,
        relationMetadata as RelationMetadataInterface,
      ),
    ).toThrow(
      `Relation metadata ${relationMetadata.id} is not related to object ${fieldMetadata.objectMetadataId}`,
    );
  });
});
