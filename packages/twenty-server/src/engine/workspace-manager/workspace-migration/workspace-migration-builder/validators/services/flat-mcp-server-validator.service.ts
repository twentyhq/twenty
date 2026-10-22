import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { McpServerExceptionCode } from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

// Tool names are prefixed with the server name and must stay valid model tool
// identifiers, so the server name is kept short and to [a-z0-9_].
const MCP_SERVER_NAME_REGEX = /^[a-z][a-z0-9_]{0,31}$/;

@Injectable()
export class FlatMcpServerValidatorService {
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);

      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private hasMcpServerWithSameName({
    name,
    excludedUniversalIdentifier,
    flatMcpServerMaps,
  }: {
    name: string;
    excludedUniversalIdentifier?: string;
    flatMcpServerMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.mcpServer
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatMcpServerMaps'];
  }): boolean {
    return Object.values(flatMcpServerMaps.byUniversalIdentifier).some(
      (existing) =>
        isDefined(existing) &&
        existing.name === name &&
        existing.universalIdentifier !== excludedUniversalIdentifier,
    );
  }

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

    if (!MCP_SERVER_NAME_REGEX.test(flatMcpServer.name)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_NAME,
        message: t`Invalid MCP server name provided`,
        userFriendlyMessage: msg`Use lowercase letters, digits and underscores, starting with a letter`,
      });
    }

    if (!isNonEmptyString(flatMcpServer.label)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      });
    }

    if (!this.isValidUrl(flatMcpServer.url)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_URL,
        message: t`Invalid MCP server URL provided`,
        userFriendlyMessage: msg`Please provide a valid HTTP or HTTPS URL`,
      });
    }

    if (
      this.hasMcpServerWithSameName({
        name: flatMcpServer.name,
        flatMcpServerMaps: optimisticFlatMcpServerMaps,
      })
    ) {
      validationResult.errors.push({
        code: McpServerExceptionCode.MCP_SERVER_NAME_ALREADY_EXISTS,
        message: t`An MCP server with this name already exists`,
        userFriendlyMessage: msg`An MCP server with this name already exists`,
      });
    }

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
      validationResult.errors.push({
        code: McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
        message: t`MCP server not found`,
        userFriendlyMessage: msg`MCP server not found`,
      });
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
      validationResult.errors.push({
        code: McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
        message: t`MCP server not found`,
        userFriendlyMessage: msg`MCP server not found`,
      });

      return validationResult;
    }

    const { name, label, url } = flatEntityUpdate;

    if (isDefined(name) && !MCP_SERVER_NAME_REGEX.test(name)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_NAME,
        message: t`Invalid MCP server name provided`,
        userFriendlyMessage: msg`Use lowercase letters, digits and underscores, starting with a letter`,
      });
    }

    if (
      isDefined(name) &&
      this.hasMcpServerWithSameName({
        name,
        excludedUniversalIdentifier: universalIdentifier,
        flatMcpServerMaps: optimisticFlatMcpServerMaps,
      })
    ) {
      validationResult.errors.push({
        code: McpServerExceptionCode.MCP_SERVER_NAME_ALREADY_EXISTS,
        message: t`An MCP server with this name already exists`,
        userFriendlyMessage: msg`An MCP server with this name already exists`,
      });
    }

    if (isDefined(label) && !isNonEmptyString(label)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      });
    }

    if (isDefined(url) && !this.isValidUrl(url)) {
      validationResult.errors.push({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_URL,
        message: t`Invalid MCP server URL provided`,
        userFriendlyMessage: msg`Please provide a valid HTTP or HTTPS URL`,
      });
    }

    return validationResult;
  }
}
