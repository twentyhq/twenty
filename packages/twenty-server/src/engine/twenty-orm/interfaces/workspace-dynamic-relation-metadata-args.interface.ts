import { type ObjectType } from 'typeorm';
import { type RelationOnDeleteAction } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type WorkspaceDynamicRelationMetadataArgsFactory = (
  oppositeObjectMetadata: ObjectMetadataEntity,
) => {
  /**
   * Standard id.
   */
  readonly standardId: string;

  /**
   * Relation name.
   */
  readonly name: string;

  /**
   * Relation label.
   */
  readonly label: string;

  /**
   * Relation description.
   */
  readonly description?: string;

  /**
   * Relation icon.
   */
  readonly icon?: string;

  /**
   * Relation join column.
   */
  readonly joinColumn?: string;
};

export interface WorkspaceDynamicRelationMetadataArgs {
  /**
   * Class to which relation is applied.
   */

  readonly target: Function;

  /**
   * Factory function
   */
  readonly argsFactory: WorkspaceDynamicRelationMetadataArgsFactory;

  /**
   * Relation type.
   */
  readonly type: RelationType;

  /**
   * Relation inverse side target.
   */
  readonly inverseSideTarget: () => ObjectType<object>;

  /**
   * Relation inverse side field key.
   */
  readonly inverseSideFieldKey?: string;

  /**
   * Relation on delete action.
   */
  readonly onDelete?: RelationOnDeleteAction;

  /**
   * Is primary field.
   */
  readonly isPrimary: boolean;

  /**
   * Is system field.
   */
  readonly isSystem: boolean;

  /**
   * Is nullable field.
   */
  readonly isNullable: boolean;

  /**
   * Field gate.
   */
  readonly gate?: Gate;
}
