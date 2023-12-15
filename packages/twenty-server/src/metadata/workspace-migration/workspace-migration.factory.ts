import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceColumnActionFactory } from 'src/metadata/workspace-migration/interfaces/workspace-column-action-factory.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceColumnActionOptions } from 'src/metadata/workspace-migration/interfaces/workspace-column-action-options.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { BasicColumnActionFactory } from 'src/metadata/workspace-migration/factories/basic-column-action.factory';
import { EnumColumnActionFactory } from 'src/metadata/workspace-migration/factories/enum-column-action.factory';
import {
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { isCompositeFieldMetadataType } from 'src/metadata/field-metadata/utils/is-composite-field-metadata-type.util';
import { fullNameFields } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { currencyFields } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
import { linkFields } from 'src/metadata/field-metadata/composite-types/link.composite-type';

type CompositeFieldsDefinitionFunction = (
  fieldMetadata: FieldMetadataInterface,
) => FieldMetadataInterface[];

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
  private compositeDefinitions = new Map<
    string,
    CompositeFieldsDefinitionFunction
  >();

  constructor(
    private readonly basicColumnActionFactory: BasicColumnActionFactory,
    private readonly enumColumnActionFactory: EnumColumnActionFactory,
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
      [
        FieldMetadataType.PHONE,
        {
          factory: this.basicColumnActionFactory,
          options: {
            defaultValue: '',
          },
        },
      ],
      [
        FieldMetadataType.EMAIL,
        {
          factory: this.basicColumnActionFactory,
          options: {
            defaultValue: '',
          },
        },
      ],
      [FieldMetadataType.NUMERIC, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.NUMBER, { factory: this.basicColumnActionFactory }],
      [
        FieldMetadataType.PROBABILITY,
        { factory: this.basicColumnActionFactory },
      ],
      [FieldMetadataType.BOOLEAN, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.DATE_TIME, { factory: this.basicColumnActionFactory }],
      [FieldMetadataType.RATING, { factory: this.enumColumnActionFactory }],
      [FieldMetadataType.SELECT, { factory: this.enumColumnActionFactory }],
      [
        FieldMetadataType.MULTI_SELECT,
        { factory: this.enumColumnActionFactory },
      ],
    ]);

    this.compositeDefinitions = new Map<
      string,
      CompositeFieldsDefinitionFunction
    >([
      [FieldMetadataType.LINK, linkFields],
      [FieldMetadataType.CURRENCY, currencyFields],
      [FieldMetadataType.FULL_NAME, fullNameFields],
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

      throw new Error(`No field metadata provided for action ${action}`);
    }

    // If it's a composite field type, we need to create a column action for each of the fields
    if (isCompositeFieldMetadataType(alteredFieldMetadata.type)) {
      const fieldMetadataSplitterFunction = this.compositeDefinitions.get(
        alteredFieldMetadata.type,
      );

      if (!fieldMetadataSplitterFunction) {
        this.logger.error(
          `No composite definition found for type ${alteredFieldMetadata.type}`,
          {
            alteredFieldMetadata,
          },
        );

        throw new Error(
          `No composite definition found for type ${alteredFieldMetadata.type}`,
        );
      }

      const fieldMetadataCollection =
        fieldMetadataSplitterFunction(alteredFieldMetadata);

      return fieldMetadataCollection.map((fieldMetadata) =>
        this.createColumnAction(action, fieldMetadata, fieldMetadata),
      );
    }

    // Otherwise, we create a single column action
    const columnAction = this.createColumnAction(
      action,
      currentFieldMetadata,
      alteredFieldMetadata,
    );

    return [columnAction];
  }

  private createColumnAction(
    action:
      | WorkspaceMigrationColumnActionType.CREATE
      | WorkspaceMigrationColumnActionType.ALTER,
    currentFieldMetadata: FieldMetadataInterface | undefined,
    alteredFieldMetadata: FieldMetadataInterface,
  ): WorkspaceMigrationColumnAction {
    const { factory, options } =
      this.factoriesMap.get(alteredFieldMetadata.type) ?? {};

    if (!factory) {
      this.logger.error(
        `No factory found for type ${alteredFieldMetadata.type}`,
        {
          alteredFieldMetadata,
        },
      );

      throw new Error(`No factory found for type ${alteredFieldMetadata.type}`);
    }

    return factory.create(
      action,
      currentFieldMetadata,
      alteredFieldMetadata,
      options,
    );
  }
}
