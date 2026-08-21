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
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath, FeatureFlagKey } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/types/rest-cursor-page-info.type';
import { paginateByIdCursor } from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fromFieldMetadataEntityToFieldMetadataDto } from 'src/engine/metadata-modules/field-metadata/utils/from-field-metadata-entity-to-field-metadata-dto.util';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { UniqueFieldMetadataIdsService } from 'src/engine/metadata-modules/index-metadata/services/unique-field-metadata-ids.service';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { type ObjectMetadataWithFieldsDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata-with-fields.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/object-metadata/filters/object-metadata-rest-api-exception.filter';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { fromObjectMetadataEntityToObjectMetadataDto } from 'src/engine/metadata-modules/object-metadata/utils/from-object-metadata-entity-to-object-metadata-dto.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { type APP_LOCALES } from 'twenty-shared/translations';
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
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly uniqueFieldMetadataIdsService: UniqueFieldMetadataIdsService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    const { items, pageInfo, totalCount } = await paginateByIdCursor({
      repository: this.objectMetadataRepository,
      workspaceId,
      request,
    });

    const [fields, uniqueFieldMetadataIds] = await Promise.all([
      this.findFieldsForObjectIds(
        workspaceId,
        items.map((object) => object.id),
      ),
      this.uniqueFieldMetadataIdsService.getForWorkspace(workspaceId),
    ]);

    const data = await this.toObjectWithFieldsDtos({
      objects: items,
      fieldsByObjectId: fields,
      uniqueFieldMetadataIds,
      locale,
      workspaceId,
    });

    const result: {
      data: ObjectMetadataWithFieldsDTO[];
      pageInfo: RestCursorPageInfo;
      totalCount: number;
    } = { data, pageInfo, totalCount };

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
    const object = await this.objectMetadataRepository.findOne({
      where: { id, workspaceId },
    });

    if (!object) {
      throw new ObjectMetadataException(
        'Object metadata not found',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const [fields, uniqueFieldMetadataIds] = await Promise.all([
      this.fieldMetadataRepository.find({
        where: { objectMetadataId: object.id, workspaceId },
      }),
      this.uniqueFieldMetadataIdsService.getForWorkspace(workspaceId),
    ]);

    const [result] = await this.toObjectWithFieldsDtos({
      objects: [object],
      fieldsByObjectId: new Map([[object.id, fields]]),
      uniqueFieldMetadataIds,
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
    const flatObject = await this.objectMetadataService.createOneObject({
      createObjectInput: input,
      workspaceId,
    });

    const [fields, uniqueFieldMetadataIds] = await Promise.all([
      this.fieldMetadataRepository.find({
        where: { objectMetadataId: flatObject.id, workspaceId },
      }),
      this.uniqueFieldMetadataIdsService.getForWorkspace(workspaceId),
    ]);

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          uniqueFieldMetadataIds,
        ),
      ),
    };

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
    const flatObject = await this.objectMetadataService.updateOneObject({
      updateObjectInput: { id, update },
      workspaceId,
    });

    const [fields, uniqueFieldMetadataIds] = await Promise.all([
      this.fieldMetadataRepository.find({
        where: { objectMetadataId: flatObject.id, workspaceId },
      }),
      this.uniqueFieldMetadataIdsService.getForWorkspace(workspaceId),
    ]);

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          uniqueFieldMetadataIds,
        ),
      ),
    };

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

  private async findFieldsForObjectIds(
    workspaceId: string,
    objectIds: string[],
  ): Promise<Map<string, FieldMetadataEntity[]>> {
    const grouped = new Map<string, FieldMetadataEntity[]>();

    if (objectIds.length === 0) {
      return grouped;
    }

    const fields = await this.fieldMetadataRepository.find({
      where: { workspaceId, objectMetadataId: In(objectIds) },
    });

    for (const field of fields) {
      const list = grouped.get(field.objectMetadataId);

      if (list) {
        list.push(field);
      } else {
        grouped.set(field.objectMetadataId, [field]);
      }
    }

    return grouped;
  }

  // REST returns the same labels the app renders: resolved for the caller's
  // locale, through the one resolver the GraphQL read path uses. Objects and
  // every field across them resolve in one call each, so a page costs a fixed
  // number of catalog reads rather than one per row.
  private async toObjectWithFieldsDtos({
    objects,
    fieldsByObjectId,
    uniqueFieldMetadataIds,
    locale,
    workspaceId,
  }: {
    objects: ObjectMetadataEntity[];
    fieldsByObjectId: Map<string, FieldMetadataEntity[]>;
    uniqueFieldMetadataIds: ReadonlySet<string>;
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<ObjectMetadataWithFieldsDTO[]> {
    const [resolvedObjects, resolvedFields] = await Promise.all([
      this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'objectMetadata',
          entities: objects,
          locale,
          workspaceId,
        },
      ),
      this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'fieldMetadata',
          entities: objects.flatMap(
            (object) => fieldsByObjectId.get(object.id) ?? [],
          ),
          locale,
          workspaceId,
        },
      ),
    ]);
    const resolvedFieldsByObjectId = new Map<string, FieldMetadataEntity[]>();

    for (const field of resolvedFields) {
      const fieldsForObject =
        resolvedFieldsByObjectId.get(field.objectMetadataId) ?? [];

      fieldsForObject.push(field);
      resolvedFieldsByObjectId.set(field.objectMetadataId, fieldsForObject);
    }

    return resolvedObjects.map((object) => ({
      ...fromObjectMetadataEntityToObjectMetadataDto(object),
      fields: (resolvedFieldsByObjectId.get(object.id) ?? []).map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          uniqueFieldMetadataIds,
        ),
      ),
    }));
  }
}
