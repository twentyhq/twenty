import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { ApiPath, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataRestListResponse } from 'src/engine/api/rest/metadata/types/metadata-rest-list-response.type';
import { paginateMetadataRestItemsById } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items-by-id.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/field-metadata/filters/field-metadata-rest-api-exception.filter';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import {
  toLegacyFieldMetadataCreateResponse,
  toLegacyFieldMetadataDeleteResponse,
  toLegacyFieldMetadataFindOneResponse,
  toLegacyFieldMetadataListResponse,
  toLegacyFieldMetadataUpdateResponse,
} from 'src/engine/metadata-modules/field-metadata/utils/to-legacy-field-metadata-response.util';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/fields`)
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  FieldMetadataRestApiExceptionFilter,
  ApplicationRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
)
@UsePipes(new ValidationPipe())
export class FieldMetadataController {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  // REST returns the same labels the app renders: resolved for the caller's
  // locale, through the one resolver the GraphQL read path uses.
  private async toPresentedFieldDtos({
    flatFieldMetadatas,
    locale,
    workspaceId,
  }: {
    flatFieldMetadatas: FlatFieldMetadata[];
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<FieldMetadataDTO[]> {
    const resolvedFlatFieldMetadatas =
      await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'fieldMetadata',
          entities: flatFieldMetadatas,
          locale,
          workspaceId,
        },
      );

    return resolvedFlatFieldMetadatas.map(
      fromFlatFieldMetadataToFieldMetadataDto,
    );
  }

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const { data, pageInfo, totalCount } = paginateMetadataRestItemsById({
      items: Object.values(flatFieldMetadataMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      request,
    });

    const result: MetadataRestListResponse<FieldMetadataDTO> = {
      data: await this.toPresentedFieldDtos({
        flatFieldMetadatas: data,
        locale,
        workspaceId,
      }),
      pageInfo,
      totalCount,
    };

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataListResponse(result);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      throw new FieldMetadataException(
        'Field metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const [result] = await this.toPresentedFieldDtos({
      flatFieldMetadatas: [flatFieldMetadata],
      locale,
      workspaceId,
    });

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataFindOneResponse(result);
  }

  @Post()
  async createOne(
    @Body() input: CreateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatField = await this.fieldMetadataService.createOneField({
      createFieldInput: input,
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataCreateResponse(result);
  }

  @Patch(':id')
  async updateOnePatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Put(':id')
  async updateOnePut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatField = await this.fieldMetadataService.deleteOneField({
      deleteOneFieldInput: { id },
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataDeleteResponse(result);
  }

  private async handleUpdate({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateFieldInput;
    workspaceId: string;
  }) {
    const flatField = await this.fieldMetadataService.updateOneField({
      updateFieldInput: { ...update, id },
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataUpdateResponse(result);
  }

  private async isNewMetadataFormat(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      workspaceId,
    );
  }
}
