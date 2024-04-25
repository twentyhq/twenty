import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Mutation, Resolver } from '@nestjs/graphql';

import { QueryArgsType } from '@ptc-org/nestjs-query-graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

@ArgsType()
export class ObjectMetadataCollectionQuery extends QueryArgsType(
  ObjectMetadataDTO,
) {}
export const ObjectMetadataConnection =
  ObjectMetadataCollectionQuery.ConnectionType;

@UseGuards(JwtAuthGuard)
@Resolver(() => ObjectMetadataDTO)
export class ObjectMetadataResolver {
  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

  // @Query(() => ObjectMetadataConnection)
  // async objects(
  //   @Args() query: ObjectMetadataCollectionQuery,
  //   @AuthWorkspace() { id: workspaceId }: Workspace,
  // ): Promise<ConnectionType<ObjectMetadataDTO>> {
  //   const objects =
  //     await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

  //   console.log({
  //     objects,
  //   });

  //   const edges = objects.map(
  //     (object) =>
  //       ({
  //         __typename: 'objectEdge',
  //         cursor: object.id,
  //         node: {
  //           ...object,
  //           fields: {
  //             __typename: 'ObjectFieldsConnection',
  //             edges: object.fields.map((field) => ({
  //               cursor: field.id,
  //               node: field,
  //             })),
  //             pageInfo: {
  //               hasNextPage: false,
  //               hasPreviousPage: false,
  //             },
  //           } as ConnectionType<FieldMetadataDTO>,
  //         },
  //       }) as EdgeType<ObjectMetadataDTO>,
  //   );

  //   return {
  //     edges,
  //     pageInfo: {
  //       hasNextPage: false,
  //       hasPreviousPage: false,
  //     },
  //   } as ConnectionType<ObjectMetadataDTO>;
  // }

  // @Query(() => ObjectMetadataConnection)
  // async initialObjects(
  //   @Args() query: ObjectMetadataCollectionQuery,
  //   @AuthWorkspace() { id: workspaceId }: Workspace,
  // ): Promise<ConnectionType<ObjectMetadataDTO>> {
  //   const objects =
  //     await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

  //   const edges = objects.map(
  //     (object) =>
  //       ({
  //         __typename: 'objectEdge',
  //         cursor: object.id,
  //         node: {
  //           ...object,
  //           fields: {
  //             __typename: 'ObjectFieldsConnection',
  //             edges: object.fields.map((field) => ({
  //               cursor: field.id,
  //               node: field,
  //             })),
  //             pageInfo: {
  //               hasNextPage: false,
  //               hasPreviousPage: false,
  //             },
  //           } as ConnectionType<FieldMetadataDTO>,
  //         },
  //       }) as EdgeType<ObjectMetadataDTO>,
  //   );

  //   return {
  //     edges,
  //     pageInfo: {
  //       hasNextPage: false,
  //       hasPreviousPage: false,
  //     },
  //   } as ConnectionType<ObjectMetadataDTO>;
  // }

  @Mutation(() => ObjectMetadataDTO)
  deleteOneObject(
    @Args('input') input: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.objectMetadataService.deleteOneObject(input, workspaceId);
  }
}
