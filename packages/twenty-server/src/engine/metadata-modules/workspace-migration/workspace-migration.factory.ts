import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-factory.interface';
import { WorkspaceColumnActionOptions } from 'src/engine/metadata-modules/workspace-migration/interfaces/workspace-column-action-options.interface';

import { BasicColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { CompositeColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { TsVectorColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';
import {
  WorkspaceMigrationColumnAction,
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
      factory: WorkspaceColumnActionFactory<any>;
      options?: WorkspaceColumnActionOptions;
    }
  >;

  constructor(
    private readonly basicColumnActionFactory: BasicColumnActionFactory,
    private readonly tsVectorColumnActionFactory: TsVectorColumnActionFactory,
    private readonly enumColumnActionFactory: EnumColumnActionFactory,
    private readonly compositeColumnActionFactory: CompositeColumnActionFactory,
  ) {
    this.factoriesMap = new Map<
      FieldMetadataType,
      {
        factory: WorkspaceColumnActionFactory<any>;
        options?: WorkspaceColumnActionOptions;
      }
    >([
      [FieldMetadataType.UUID, { factory: this.basicColumnActionFactory }],
      [
        FieldMetadataType.TEXT,
        {
          factory: this.basicColumnActionFactory,
          options: {
            defaultValue: '',
          },
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
    ]);
  }

  createColumnActions(
    action: WorkspaceMigrationColumnActionType.CREATE,
    fieldMetadata: FieldMetadataInterface,
  ): WorkspaceMigrationColumnAction[];

  createColumnActions(
    action: WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataInterface,
    alteredFieldMetadata: FieldMetadataInterface,
  ): WorkspaceMigrationColumnAction[];

  createColumnActions(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    fieldMetadataOrCurrentFieldMetadata: FieldMetadataInterface,
    undefinedOrAlteredFieldMetadata?: FieldMetadataInterface,
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
    currentFieldMetadata: FieldMetadataInterface | undefined,
    alteredFieldMetadata: FieldMetadataInterface,
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
