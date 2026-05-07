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
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import {
  paginateByIdCursor,
  type RestCursorPageInfo,
} from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
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
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/object-metadata/filters/object-metadata-rest-api-exception.filter';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { fromObjectMetadataEntityToObjectMetadataDto } from 'src/engine/metadata-modules/object-metadata/utils/from-object-metadata-entity-to-object-metadata-dto.util';

@Controller('rest/metadata/objects')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(ObjectMetadataRestApiExceptionFilter)
export class ObjectMetadataRestApiController {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<{
    data: ObjectMetadataWithFieldsDTO[];
    pageInfo: RestCursorPageInfo;
    totalCount: number;
  }> {
    const { items, pageInfo, totalCount } = await paginateByIdCursor({
      repository: this.objectMetadataRepository,
      where: { workspaceId },
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

    return { data, pageInfo, totalCount };
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataWithFieldsDTO> {
    const object = await this.objectMetadataRepository.findOne({
      where: { id, workspaceId },
    });

    if (!object) {
      throw new ObjectMetadataException(
        `Object metadata with id ${id} not found`,
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: object.id, workspaceId },
    });

    return this.toObjectWithFieldsDto(object, fields);
  }

  @Post()
  async createOne(
    @Body() input: CreateObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataWithFieldsDTO> {
    const flatObject = await this.objectMetadataService.createOneObject({
      createObjectInput: input,
      workspaceId,
    });

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: flatObject.id, workspaceId },
    });

    return {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map(fromFieldMetadataEntityToFieldMetadataDto),
    };
  }

  @Patch(':id')
  async updateOnePatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateObjectPayload,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataWithFieldsDTO> {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Put(':id')
  async updateOnePut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateObjectPayload,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataWithFieldsDTO> {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataDTO> {
    const flatObject = await this.objectMetadataService.deleteOneObject({
      deleteObjectInput: { id },
      workspaceId,
    });

    return fromFlatObjectMetadataToObjectMetadataDto(flatObject);
  }

  private async handleUpdate({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateObjectPayload;
    workspaceId: string;
  }): Promise<ObjectMetadataWithFieldsDTO> {
    const flatObject = await this.objectMetadataService.updateOneObject({
      updateObjectInput: { id, update },
      workspaceId,
    });

    const fields = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: flatObject.id, workspaceId },
    });

    return {
      ...fromFlatObjectMetadataToObjectMetadataDto(flatObject),
      fields: fields.map(fromFieldMetadataEntityToFieldMetadataDto),
    };
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
