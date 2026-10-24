import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, isValidUrl } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { MCP_SERVER_NAME_REGEX } from 'src/engine/metadata-modules/mcp-server/constants/mcp-server-name-regex.constant';
import { McpServerExceptionCode } from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatMcpServerValidatorService {
  public validateFlatMcpServerCreation({
    flatEntityToValidate: flatMcpServer,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMcpServerMaps: optimisticFlatMcpServerMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.mcpServer
  >): FailedFlatEntityValidation<'mcpServer', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatMcpServer.universalIdentifier,
        name: flatMcpServer.name,
      },
      metadataName: 'mcpServer',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.getNameErrors({
        name: flatMcpServer.name,
        universalIdentifier: flatMcpServer.universalIdentifier,
        flatMcpServerMaps: optimisticFlatMcpServerMaps,
      }),
      ...this.getLabelErrors(flatMcpServer.label),
      ...this.getUrlErrors(flatMcpServer.url),
    );

    return validationResult;
  }

  public validateFlatMcpServerDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMcpServerMaps: optimisticFlatMcpServerMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.mcpServer
  >): FailedFlatEntityValidation<'mcpServer', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'mcpServer',
      type: 'delete',
    });

    const existingMcpServer = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatMcpServerMaps,
    });

    if (!isDefined(existingMcpServer)) {
      validationResult.errors.push(this.getNotFoundError());
    }

    return validationResult;
  }

  public validateFlatMcpServerUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMcpServerMaps: optimisticFlatMcpServerMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.mcpServer
  >): FailedFlatEntityValidation<'mcpServer', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'mcpServer',
      type: 'update',
    });

    const existingMcpServer = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatMcpServerMaps,
    });

    if (!isDefined(existingMcpServer)) {
      validationResult.errors.push(this.getNotFoundError());

      return validationResult;
    }

    const { name, label, url } = flatEntityUpdate;

    validationResult.errors.push(
      ...(isDefined(name)
        ? this.getNameErrors({
            name,
            universalIdentifier,
            flatMcpServerMaps: optimisticFlatMcpServerMaps,
          })
        : []),
      ...(isDefined(label) ? this.getLabelErrors(label) : []),
      ...(isDefined(url) ? this.getUrlErrors(url) : []),
    );

    return validationResult;
  }

  private getNotFoundError(): FlatEntityValidationError<McpServerExceptionCode> {
    return {
      code: McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
      message: t`MCP server not found`,
      userFriendlyMessage: msg`MCP server not found`,
    };
  }

  private getNameErrors({
    name,
    universalIdentifier,
    flatMcpServerMaps,
  }: {
    name: string;
    universalIdentifier: string;
    flatMcpServerMaps: MetadataUniversalFlatEntityMaps<'mcpServer'>;
  }): FlatEntityValidationError<McpServerExceptionCode>[] {
    const errors: FlatEntityValidationError<McpServerExceptionCode>[] = [];

    if (!MCP_SERVER_NAME_REGEX.test(name)) {
      errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_NAME,
        message: t`Invalid MCP server name provided`,
        userFriendlyMessage: msg`Use lowercase letters, digits and underscores, starting with a letter`,
      });
    }

    const hasSameName = Object.values(
      flatMcpServerMaps.byUniversalIdentifier,
    ).some(
      (existingMcpServer) =>
        isDefined(existingMcpServer) &&
        existingMcpServer.name === name &&
        existingMcpServer.universalIdentifier !== universalIdentifier,
    );

    if (hasSameName) {
      errors.push({
        code: McpServerExceptionCode.MCP_SERVER_NAME_ALREADY_EXISTS,
        message: t`An MCP server with this name already exists`,
        userFriendlyMessage: msg`An MCP server with this name already exists`,
      });
    }

    return errors;
  }

  private getLabelErrors(
    label: string,
  ): FlatEntityValidationError<McpServerExceptionCode>[] {
    if (isNonEmptyString(label)) {
      return [];
    }

    return [
      {
        code: McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      },
    ];
  }

  private getUrlErrors(
    url: string,
  ): FlatEntityValidationError<McpServerExceptionCode>[] {
    if (isValidUrl(url)) {
      return [];
    }

    return [
      {
        code: McpServerExceptionCode.INVALID_MCP_SERVER_URL,
        message: t`Invalid MCP server URL provided`,
        userFriendlyMessage: msg`Please provide a valid HTTP or HTTPS URL`,
      },
    ];
  }
}
