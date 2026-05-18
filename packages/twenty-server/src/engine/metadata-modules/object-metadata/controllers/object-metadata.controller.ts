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

import { In, Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import {
  paginateByIdCursor,
  type RestCursorPageInfo,
} from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fromFieldMetadataEntityToFieldMetadataDto } from 'src/engine/metadata-modules/field-metadata/utils/from-field-metadata-entity-to-field-metadata-dto.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
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

@Controller('rest/metadata/objects')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(ObjectMetadataRestApiExceptionFilter)
@UsePipes(new ValidationPipe())
export class ObjectMetadataController {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

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

    const fields = await this.findFieldsForObjectIds(
      workspaceId,
      items.map((object) => object.id),
    );

    const data = items.map((object) =>
      this.toObjectWithFieldsDto(object, fields.get(object.id) ?? []),
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

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: object.id, workspaceId },
    });

    const result = this.toObjectWithFieldsDto(object, fields);

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

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: flatObject.id, workspaceId },
    });

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map(fromFieldMetadataEntityToFieldMetadataDto),
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

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: flatObject.id, workspaceId },
    });

    const result: ObjectMetadataWithFieldsDTO = {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map(fromFieldMetadataEntityToFieldMetadataDto),
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
  ): ObjectMetadataWithFieldsDTO {
    return {
      ...fromObjectMetadataEntityToObjectMetadataDto(object),
      fields: fields.map(fromFieldMetadataEntityToFieldMetadataDto),
    };
  }
}
