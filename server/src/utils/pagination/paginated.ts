import { Type } from '@nestjs/common';
import { ArgsType, Directive, Field, ObjectType } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString } from 'class-validator';

import { PageInfo } from './page-info';

import { IConnectionArguments } from './interfaces/connection-arguments.interface';
import { IConnection } from './interfaces/connection.interface';
import { IEdge } from './interfaces/edge.interface';
import { IPageInfo } from './interfaces/page-info.interface';

export type ConnectionCursor = string;

/**
 * ConnectionArguments
 */
@ArgsType()
export class ConnectionArgs implements IConnectionArguments {
  @Field({ nullable: true, description: 'Paginate before opaque cursor' })
  @IsString()
  @IsOptional()
  public before?: ConnectionCursor;

  @Field({ nullable: true, description: 'Paginate after opaque cursor' })
  @IsString()
  @IsOptional()
  public after?: ConnectionCursor;

  @Field({ nullable: true, description: 'Paginate first' })
  @IsNumber()
  @IsOptional()
  public first?: number;

  @Field({ nullable: true, description: 'Paginate last' })
  @IsNumber()
  @IsOptional()
  public last?: number;
}

/**
 * Paginated graphQL class inheritance
 */
export function Paginated<T>(classRef: Type<T>): Type<IConnection<T>> {
  @ObjectType(`${classRef.name}Edge`, { isAbstract: true })
  class Edge implements IEdge<T> {
    public name = `${classRef.name}Edge`;

    @Field({ nullable: true })
    public cursor!: ConnectionCursor;

    @Field(() => classRef, { nullable: true })
    @Directive(`@cacheControl(inheritMaxAge: true)`)
    public node!: T;
  }

  @ObjectType(`${classRef.name}Connection`, { isAbstract: true })
  class Connection implements IConnection<T> {
    public name = `${classRef.name}Connection`;

    @Field(() => [Edge], { nullable: true })
    @Directive(`@cacheControl(inheritMaxAge: true)`)
    public edges!: IEdge<T>[];

    @Field(() => PageInfo, { nullable: true })
    @Directive(`@cacheControl(inheritMaxAge: true)`)
    public pageInfo!: IPageInfo;

    @Field()
    totalCount: number;
  }

  return Connection as Type<IConnection<T>>;
}

// export const encodeCursor = <Cursor>(cursor: Cursor) =>
//   Buffer.from(JSON.stringify(cursor)).toString('base64');

// export const decodeCursor = <Cursor>(cursor: string) =>
//   JSON.parse(Buffer.from(cursor, 'base64').toString('ascii')) as Cursor;
