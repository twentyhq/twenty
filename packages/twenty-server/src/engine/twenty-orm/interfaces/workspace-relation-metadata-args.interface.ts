import { ObjectType } from 'typeorm';

import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface WorkspaceRelationMetadataArgs {
  /**
   * Standard id.
   */
  readonly standardId: string;

  /**
   * Class to which relation is applied.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly target: Function;

  /**
   * Relation name.
   */
  readonly name: string;

  /**
   * Relation label.
   */
  readonly label: string | ((objectMetadata: ObjectMetadataEntity) => string);

  /**
   * Relation type.
   */
  readonly type: RelationMetadataType;

  /**
   * Relation description.
   */
  readonly description?:
    | string
    | ((objectMetadata: ObjectMetadataEntity) => string);

  /**
   * Relation icon.
   */
  readonly icon?: string;

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

  /**
   * Is active field.
   */
  readonly isActive?: boolean;
}
