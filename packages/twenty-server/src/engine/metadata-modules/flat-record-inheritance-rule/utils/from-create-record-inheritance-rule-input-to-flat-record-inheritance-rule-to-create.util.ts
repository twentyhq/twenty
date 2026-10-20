/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CreateRecordInheritanceRuleInput } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/create-record-inheritance-rule.input';

export const fromCreateRecordInheritanceRuleInputToFlatRecordInheritanceRuleToCreate =
  ({
    createRecordInheritanceRuleInput: {
      objectMetadataId,
      fieldMetadataId,
      junctionFieldMetadataId,
    },
    workspaceId,
    flatApplication,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    createRecordInheritanceRuleInput: CreateRecordInheritanceRuleInput;
    workspaceId: string;
    flatApplication: FlatApplication;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >): FlatRecordInheritanceRule => {
    const lastPathFieldMetadataId = junctionFieldMetadataId ?? fieldMetadataId;

    const parentObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: lastPathFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    })?.relationTargetObjectMetadataId;

    if (!isDefined(parentObjectMetadataId)) {
      throw new PermissionsException(
        `Field ${lastPathFieldMetadataId} is not a relation`,
        PermissionsExceptionCode.INVALID_SETTING,
      );
    }

    const id = v4();
    const now = new Date().toISOString();

    const {
      objectMetadataUniversalIdentifier,
      parentObjectMetadataUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      junctionFieldMetadataUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'recordInheritanceRule',
      foreignKeyValues: {
        objectMetadataId,
        parentObjectMetadataId,
        fieldMetadataId,
        junctionFieldMetadataId: junctionFieldMetadataId ?? null,
      },
      flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
    });

    return {
      id,
      universalIdentifier: id,
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      objectMetadataId,
      objectMetadataUniversalIdentifier,
      parentObjectMetadataId,
      parentObjectMetadataUniversalIdentifier,
      fieldMetadataId,
      fieldMetadataUniversalIdentifier,
      junctionFieldMetadataId: junctionFieldMetadataId ?? null,
      junctionFieldMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };
