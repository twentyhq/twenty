import { type Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectionCursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageInfoDTO } from 'src/engine/metadata-modules/pagination/dtos/page-info.dto';

// These factories mirror the edge/connection object types that
// @ptc-org/nestjs-query-graphql used to generate, so type names, field
// descriptions and shapes stay identical in the public metadata schema.
export type CursorEdge<TNode> = {
  node: TNode;
  cursor: string;
};

export type CursorConnection<TNode> = {
  edges: CursorEdge<TNode>[];
  pageInfo: PageInfoDTO;
};

export const createCursorEdgeType = <TNode>(
  nodeClassReference: Type<TNode>,
  nodeGraphqlTypeName: string,
  edgeGraphqlTypeName: string,
): Type<CursorEdge<TNode>> => {
  @ObjectType(edgeGraphqlTypeName)
  class EdgeType {
    @Field(() => nodeClassReference, {
      description: `The node containing the ${nodeGraphqlTypeName}`,
    })
    node: TNode;

    @Field(() => ConnectionCursorScalarType, {
      description: 'Cursor for this node.',
    })
    cursor: string;
  }

  return EdgeType;
};

export const createCursorConnectionType = <TNode>(
  edgeClassReference: Type<CursorEdge<TNode>>,
  connectionGraphqlTypeName: string,
): Type<CursorConnection<TNode>> => {
  @ObjectType(connectionGraphqlTypeName)
  class ConnectionType {
    @Field(() => PageInfoDTO, { description: 'Paging information' })
    pageInfo: PageInfoDTO;

    @Field(() => [edgeClassReference], { description: 'Array of edges.' })
    edges: CursorEdge<TNode>[];
  }

  return ConnectionType;
};
