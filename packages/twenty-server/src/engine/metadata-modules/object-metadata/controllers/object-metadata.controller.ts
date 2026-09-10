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
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { type ObjectMetadataWithFieldsDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata-with-fields.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/object-metadata/filters/object-metadata-rest-api-exception.filter';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  toLegacyObjectMetadataCreateResponse,
  toLegacyObjectMetadataDeleteResponse,
  toLegacyObjectMetadataFindOneResponse,
  toLegacyObjectMetadataListResponse,
  toLegacyObjectMetadataUpdateResponse,
} from 'src/engine/metadata-modules/object-metadata/utils/to-legacy-object-metadata-response.util';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/objects`)
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  ObjectMetadataRestApiExceptionFilter,
  ApplicationRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
)
@UsePipes(new ValidationPipe())
export class ObjectMetadataController {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.getFlatObjectAndFieldMetadataMaps(workspaceId);

    const { data, pageInfo, totalCount } = paginateMetadataRestItemsById({
      items: Object.values(flatObjectMetadataMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      request,
    });

    const result: MetadataRestListResponse<ObjectMetadataWithFieldsDTO> = {
      data: await this.toObjectWithFieldsDtos({
        flatObjectMetadatas: data,
        flatFieldMetadataMaps,
        locale,
        workspaceId,
      }),
      pageInfo,
      totalCount,
    };

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyObjectMetadataListResponse(result);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.getFlatObjectAndFieldMetadataMaps(workspaceId);

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Object metadata not found',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const [result] = await this.toObjectWithFieldsDtos({
      flatObjectMetadatas: [flatObjectMetadata],
      flatFieldMetadataMaps,
      locale,
      workspaceId,
    });

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyObjectMetadataFindOneResponse(result);
  }

  @Post()
  async createOne(
    @Body() input: CreateObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatObjectMetadata = await this.objectMetadataService.createOneObject(
      {
        createObjectInput: input,
        workspaceId,
      },
    );

    const result = await this.toObjectWithFieldsDto({
      flatObjectMetadata,
      workspaceId,
    });

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyObjectMetadataCreateResponse(result);
  }

  @Patch(':id')
  async updateOnePatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateObjectPayload,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Put(':id')
  async updateOnePut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateObjectPayload,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatObject = await this.objectMetadataService.deleteOneObject({
      deleteObjectInput: { id },
      workspaceId,
    });

    const result = fromFlatObjectMetadataToObjectMetadataDto(flatObject);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyObjectMetadataDeleteResponse(result);
  }

  private async handleUpdate({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateObjectPayload;
    workspaceId: string;
  }) {
    const flatObjectMetadata = await this.objectMetadataService.updateOneObject(
      {
        updateObjectInput: { id, update },
        workspaceId,
      },
    );

    const result = await this.toObjectWithFieldsDto({
      flatObjectMetadata,
      workspaceId,
    });

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyObjectMetadataUpdateResponse(result);
  }

  private async isNewMetadataFormat(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      workspaceId,
    );
  }

  private async getFlatObjectAndFieldMetadataMaps(workspaceId: string) {
    return this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      },
    );
  }

  private async toObjectWithFieldsDto({
    flatObjectMetadata,
    workspaceId,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    workspaceId: string;
  }): Promise<ObjectMetadataWithFieldsDTO> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    return {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata),
      fields: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      }).map(fromFlatFieldMetadataToFieldMetadataDto),
    };
  }

  // REST returns the same labels the app renders: resolved for the caller's
  // locale, through the one resolver the GraphQL read path uses. Objects and
  // every field across them resolve in one call each, so a page costs a fixed
  // number of catalog reads rather than one per row.
  private async toObjectWithFieldsDtos({
    flatObjectMetadatas,
    flatFieldMetadataMaps,
    locale,
    workspaceId,
  }: {
    flatObjectMetadatas: FlatObjectMetadata[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<ObjectMetadataWithFieldsDTO[]> {
    const [resolvedFlatObjectMetadatas, resolvedFlatFieldMetadatas] =
      await Promise.all([
        this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
          {
            metadataName: 'objectMetadata',
            entities: flatObjectMetadatas,
            locale,
            workspaceId,
          },
        ),
        this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
          {
            metadataName: 'fieldMetadata',
            entities: flatObjectMetadatas.flatMap((flatObjectMetadata) =>
              findManyFlatEntityByIdInFlatEntityMaps({
                flatEntityIds: flatObjectMetadata.fieldIds,
                flatEntityMaps: flatFieldMetadataMaps,
              }),
            ),
            locale,
            workspaceId,
          },
        ),
      ]);

    const resolvedFlatFieldMetadatasByObjectMetadataId = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const flatFieldMetadata of resolvedFlatFieldMetadatas) {
      const flatFieldMetadatasForObject =
        resolvedFlatFieldMetadatasByObjectMetadataId.get(
          flatFieldMetadata.objectMetadataId,
        ) ?? [];

      flatFieldMetadatasForObject.push(flatFieldMetadata);
      resolvedFlatFieldMetadatasByObjectMetadataId.set(
        flatFieldMetadata.objectMetadataId,
        flatFieldMetadatasForObject,
      );
    }

    return resolvedFlatObjectMetadatas.map((flatObjectMetadata) => ({
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata),
      fields: (
        resolvedFlatFieldMetadatasByObjectMetadataId.get(
          flatObjectMetadata.id,
        ) ?? []
      ).map(fromFlatFieldMetadataToFieldMetadataDto),
    }));
  }
}
