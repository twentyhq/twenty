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
import { FeatureFlagKey } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import {
  paginateByIdCursor,
  type RestCursorPageInfo,
} from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
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
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { computeUniqueFieldMetadataIdsFromFlatIndexMaps } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-flat-index-maps.util';
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
import {
  toLegacyObjectMetadataCreateResponse,
  toLegacyObjectMetadataDeleteResponse,
  toLegacyObjectMetadataFindOneResponse,
  toLegacyObjectMetadataListResponse,
  toLegacyObjectMetadataUpdateResponse,
} from 'src/engine/metadata-modules/object-metadata/utils/to-legacy-object-metadata-response.util';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { getTwentyStandardApplicationIdOrThrow } from 'src/engine/metadata-modules/utils/get-twenty-standard-application-id-or-throw.util';

@Controller('rest/metadata/objects')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  ObjectMetadataRestApiExceptionFilter,
  ApplicationRestApiExceptionFilter,
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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async loadUniqueFieldMetadataIds(
    workspaceId: string,
  ): Promise<ReadonlySet<string>> {
    const { flatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatIndexMaps'] },
      );

    return computeUniqueFieldMetadataIdsFromFlatIndexMaps(flatIndexMaps);
  }

  private async loadStandardApplicationId(
    workspaceId: string,
  ): Promise<string> {
    const { flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatApplicationMaps'] },
      );

    return getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);
  }

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { items, pageInfo, totalCount } = await paginateByIdCursor({
      repository: this.objectMetadataRepository,
      workspaceId,
      limit: parseLimitRestRequest(request),
      startingAfter: parseStartingAfterRestRequest(request),
      endingBefore: parseEndingBeforeRestRequest(request),
    });

    const [fields, uniqueFieldMetadataIds, standardApplicationId] =
      await Promise.all([
        this.findFieldsForObjectIds(
          workspaceId,
          items.map((object) => object.id),
        ),
        this.loadUniqueFieldMetadataIds(workspaceId),
        this.loadStandardApplicationId(workspaceId),
      ]);

    const data = items.map((object) =>
      this.toObjectWithFieldsDto(
        object,
        fields.get(object.id) ?? [],
        uniqueFieldMetadataIds,
        standardApplicationId,
      ),
    );

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

    const [fields, uniqueFieldMetadataIds, standardApplicationId] =
      await Promise.all([
        this.fieldMetadataRepository.find({
          where: { objectMetadataId: object.id, workspaceId },
        }),
        this.loadUniqueFieldMetadataIds(workspaceId),
        this.loadStandardApplicationId(workspaceId),
      ]);

    const result = this.toObjectWithFieldsDto(
      object,
      fields,
      uniqueFieldMetadataIds,
      standardApplicationId,
    );

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

    const [fields, uniqueFieldMetadataIds, standardApplicationId] =
      await Promise.all([
        this.fieldMetadataRepository.find({
          where: { objectMetadataId: flatObject.id, workspaceId },
        }),
        this.loadUniqueFieldMetadataIds(workspaceId),
        this.loadStandardApplicationId(workspaceId),
      ]);

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          standardApplicationId,
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

    const [fields, uniqueFieldMetadataIds, standardApplicationId] =
      await Promise.all([
        this.fieldMetadataRepository.find({
          where: { objectMetadataId: flatObject.id, workspaceId },
        }),
        this.loadUniqueFieldMetadataIds(workspaceId),
        this.loadStandardApplicationId(workspaceId),
      ]);

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          standardApplicationId,
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

  private toObjectWithFieldsDto(
    object: ObjectMetadataEntity,
    fields: FieldMetadataEntity[],
    uniqueFieldMetadataIds: ReadonlySet<string>,
    standardApplicationId: string,
  ): ObjectMetadataWithFieldsDTO {
    return {
      ...fromObjectMetadataEntityToObjectMetadataDto(
        object,
        standardApplicationId,
      ),
      fields: fields.map((field) =>
        fromFieldMetadataEntityToFieldMetadataDto(
          field,
          standardApplicationId,
          uniqueFieldMetadataIds,
        ),
      ),
    };
  }
}
