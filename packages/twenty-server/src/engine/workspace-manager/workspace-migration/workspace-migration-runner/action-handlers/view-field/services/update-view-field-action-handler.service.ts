import { Injectable } from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateViewFieldAction,
  UniversalUpdateViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import { fromUniversalOverridesToViewFieldOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/utils/from-universal-overrides-to-view-field-overrides.util';
import { fromUniversalRelationScopeToViewFieldRelationScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/utils/from-universal-relation-scope-to-view-field-relation-scope.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewField',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateViewFieldAction>,
  ): Promise<FlatUpdateViewFieldAction> {
    const { action, allFlatEntityMaps } = context;

    const flatViewField = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatViewFieldMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const {
      universalOverrides,
      universalRelationScope,
      ...updateWithResolvedForeignKeys
    } = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'viewField',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    const update = {
      ...updateWithResolvedForeignKeys,
      ...this.transpileUniversalOverrides({
        universalOverrides,
        flatViewFieldGroupMaps: allFlatEntityMaps.flatViewFieldGroupMaps,
      }),
      ...this.transpileUniversalRelationScope({
        universalRelationScope,
        flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      }),
    };

    return {
      type: 'update',
      metadataName: 'viewField',
      entityId: flatViewField.id,
      update,
    };
  }

  private transpileUniversalOverrides({
    universalOverrides,
    flatViewFieldGroupMaps,
  }: {
    universalOverrides: UniversalUpdateViewFieldAction['update']['universalOverrides'];
    flatViewFieldGroupMaps: AllFlatEntityMaps['flatViewFieldGroupMaps'];
  }): Pick<FlatUpdateViewFieldAction['update'], 'overrides'> {
    if (universalOverrides === undefined) {
      return {};
    }

    if (universalOverrides === null) {
      return { overrides: null };
    }

    return {
      overrides: fromUniversalOverridesToViewFieldOverrides({
        universalOverrides,
        flatViewFieldGroupMaps,
      }),
    };
  }

  private transpileUniversalRelationScope({
    universalRelationScope,
    flatFieldMetadataMaps,
  }: {
    universalRelationScope: UniversalUpdateViewFieldAction['update']['universalRelationScope'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): Pick<FlatUpdateViewFieldAction['update'], 'relationScope'> {
    if (universalRelationScope === undefined) {
      return {};
    }

    if (universalRelationScope === null) {
      return { relationScope: null };
    }

    return {
      relationScope: fromUniversalRelationScopeToViewFieldRelationScope({
        universalRelationScope,
        flatFieldMetadataMaps,
      }),
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFieldAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    // TypeORM's deep partial cannot express the jsonb filter value union
    await viewFieldRepository.update(
      { id: entityId, workspaceId },
      update as QueryDeepPartialEntity<ViewFieldEntity>,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
