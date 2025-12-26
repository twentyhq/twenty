import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-factory.interface';
import { type WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BasicColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { CompositeColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { MorphRelationColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/morph-relation-column-action.factory';
import { RelationColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/relation-column-action.factory';
import {
  TsVectorColumnActionFactory,
  type TsVectorFieldMetadata,
} from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';
import {
  type WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

@Injectable()
export class WorkspaceMigrationFactory {
  private readonly logger = new Logger(WorkspaceMigrationFactory.name);
  private factoriesMap: Map<
    FieldMetadataType,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      factory: WorkspaceColumnActionFactory<any>;
      options?: WorkspaceColumnActionOptions;
    }
  >;

  constructor(
    private readonly basicColumnActionFactory: BasicColumnActionFactory,
    private readonly tsVectorColumnActionFactory: TsVectorColumnActionFactory,
    private readonly enumColumnActionFactory: EnumColumnActionFactory,
    private readonly compositeColumnActionFactory: CompositeColumnActionFactory,
    private readonly relationColumnActionFactory: RelationColumnActionFactory,
    private readonly morphRelationColumnActionFactory: MorphRelationColumnActionFactory,
  ) {
    this.factoriesMap = new Map<
      FieldMetadataType,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        factory: WorkspaceColumnActionFactory<any>;
        options?: WorkspaceColumnActionOptions;
      }
    >([
      [FieldMetadataType.UUID, { factory: this.basicColumnActionFactory }],
      [
        FieldMetadataType.TEXT,
        {
          factory: this.basicColumnActionFactory,
        },
      ],
      [FieldMetadataType.NUMERIC, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.NUMBER, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.POSITION, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.RAW_JSON, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.RICH_TEXT, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.BOOLEAN, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.DATE_TIME, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.DATE, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.RATING, { factory: this.enumColumnActionFactory }],
      [FieldMetadataType.SELECT, { factory: this.enumColumnActionFactory }],
      [
        FieldMetadataType.MULTI_SELECT,
        { factory: this.enumColumnActionFactory },
      ],
      [
        FieldMetadataType.CURRENCY,
        { factory: this.compositeColumnActionFactory },
      ],
      [
        FieldMetadataType.ADDRESS,
        { factory: this.compositeColumnActionFactory },
      ],
      [
        FieldMetadataType.FULL_NAME,
        { factory: this.compositeColumnActionFactory },
      ],
      [FieldMetadataType.LINKS, { factory: this.compositeColumnActionFactory }],
      [FieldMetadataType.ACTOR, { factory: this.compositeColumnActionFactory }],
      [FieldMetadataType.ARRAY, { factory: this.basicColumnActionFactory }],
      [
        FieldMetadataType.EMAILS,
        { factory: this.compositeColumnActionFactory },
      ],
      [
        FieldMetadataType.PHONES,
        { factory: this.compositeColumnActionFactory },
      ],
      [
        FieldMetadataType.TS_VECTOR,
        { factory: this.tsVectorColumnActionFactory },
      ],
      [
        FieldMetadataType.RICH_TEXT_V2,
        { factory: this.compositeColumnActionFactory },
      ],
      [
        FieldMetadataType.RELATION,
        { factory: this.relationColumnActionFactory },
      ],
      [
        FieldMetadataType.MORPH_RELATION,
        { factory: this.morphRelationColumnActionFactory },
      ],
    ]);
  }

  createColumnActions<T extends FieldMetadataType = FieldMetadataType>(
    action: WorkspaceMigrationColumnActionType.CREATE,
    fieldMetadata: FieldMetadataEntity<T>,
  ): WorkspaceMigrationColumnAction[];

  createColumnActions(
    action: WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataEntity,
    alteredFieldMetadata: FieldMetadataEntity,
  ): WorkspaceMigrationColumnAction[];

  createColumnActions(
    action: WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataEntity,
    alteredFieldMetadata: TsVectorFieldMetadata,
  ): WorkspaceMigrationColumnAction[];

  createColumnActions(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    fieldMetadataOrCurrentFieldMetadata: FieldMetadataEntity,
    undefinedOrAlteredFieldMetadata?: FieldMetadataEntity,
  ): WorkspaceMigrationColumnAction[] {
    const currentFieldMetadata =
      action === WorkspaceMigrationColumnActionType.ALTER
        ? fieldMetadataOrCurrentFieldMetadata
        : undefined;
    const alteredFieldMetadata =
      action === WorkspaceMigrationColumnActionType.CREATE
        ? fieldMetadataOrCurrentFieldMetadata
        : undefinedOrAlteredFieldMetadata;

    if (!alteredFieldMetadata) {
      this.logger.error(
        `No field metadata provided for action ${action}`,
        undefinedOrAlteredFieldMetadata,
      );

      throw new WorkspaceMigrationException(
        `No field metadata provided for action ${action}`,
        WorkspaceMigrationExceptionCode.INVALID_ACTION,
      );
    }

    const columnActions = this.createColumnAction(
      action,
      currentFieldMetadata,
      alteredFieldMetadata,
    );

    return columnActions;
  }

  private createColumnAction(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataEntity | undefined,
    alteredFieldMetadata: FieldMetadataEntity,
  ): WorkspaceMigrationColumnAction[] {
    const { factory, options } =
      this.factoriesMap.get(alteredFieldMetadata.type) ?? {};

    if (!factory) {
      this.logger.error(
        `No factory found for type ${alteredFieldMetadata.type}`,
        {
          alteredFieldMetadata,
        },
      );

      throw new WorkspaceMigrationException(
        `No factory found for type ${alteredFieldMetadata.type}`,
        WorkspaceMigrationExceptionCode.NO_FACTORY_FOUND,
      );
    }

    return factory.create(
      action,
      currentFieldMetadata,
      alteredFieldMetadata,
      options,
    );
  }
}
