import {
  type FieldMetadataType,
  type FieldMetadataSettings,
  type FieldMetadataOptions,
} from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export interface WorkspaceFieldMetadataArgs {
  /**
   * Standard id.
   */
  readonly standardId: string;

  /**
   * Class to which field is applied.
   */

  readonly target: Function;

  /**
   * Field name.
   */
  readonly name: string;

  /**
   * Field label.
   */
  readonly label: string | ((objectMetadata: ObjectMetadataEntity) => string);

  /**
   * Field type.
   */
  readonly type: FieldMetadataType;

  /**
   * Field description.
   */
  readonly description?:
    | string
    | ((objectMetadata: ObjectMetadataEntity) => string);

  /**
   * Field icon.
   */
  readonly icon?: string;

  /**
   * Field default value.
   */
  readonly defaultValue?: FieldMetadataDefaultValue;

  /**
   * Field options.
   */
  readonly options?: FieldMetadataOptions;

  /**
   * Field settings.
   */
  readonly settings?: FieldMetadataSettings;

  /**
   * Is primary field.
   */
  readonly isPrimary: boolean;

  /**
   * Is system field.
   */
  readonly isSystem: boolean;

  /**
   * Is UI read-only field.
   */
  readonly isUIReadOnly: boolean;

  /**
   * Is nullable field.
   */
  readonly isNullable: boolean;

  /**
   * Is unique field.
   */
  readonly isUnique: boolean;

  /**
   * Field gate.
   */
  readonly gate?: Gate;

  /**
   * Is deprecated field.
   */
  readonly isDeprecated?: boolean;

  /**
   * Is active field.
   */
  readonly isActive?: boolean;

  /**
   * Is active field.
   */
  readonly generatedType?: 'STORED' | 'VIRTUAL';

  /**
   * Is active field.
   */
  readonly asExpression?: string;

  readonly isLabelSyncedWithName: boolean;
}
