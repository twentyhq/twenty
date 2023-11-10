import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime, GraphQLTimestamp } from '@nestjs/graphql';

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  GraphQLType,
} from 'graphql';

import {
  DateScalarMode,
  NumberScalarMode,
} from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  UUIDFilterType,
  StringFilterType,
  DatetimeFilterType,
  DateFilterType,
  FloatFilterType,
  IntFilterType,
  BooleanFilterType,
} from 'src/tenant/schema-builder/graphql-types/input';
import { OrderByDirectionType } from 'src/tenant/schema-builder/graphql-types/enum';

export interface TypeOptions<T = any> {
  nullable?: boolean;
  isArray?: boolean;
  arrayDepth?: number;
  defaultValue?: T;
}

@Injectable()
export class TypeMapperService {
  mapToScalarType(
    fieldMetadataType: FieldMetadataType,
    dateScalarMode: DateScalarMode = 'isoDate',
    numberScalarMode: NumberScalarMode = 'float',
  ): GraphQLScalarType | undefined {
    const dateScalar =
      dateScalarMode === 'timestamp' ? GraphQLTimestamp : GraphQLISODateTime;
    const numberScalar =
      numberScalarMode === 'float' ? GraphQLFloat : GraphQLInt;

    // URL and MONEY are handled in the factories because they are objects
    const typeScalarMapping = new Map<FieldMetadataType, GraphQLScalarType>([
      [FieldMetadataType.UUID, GraphQLID],
      [FieldMetadataType.TEXT, GraphQLString],
      [FieldMetadataType.PHONE, GraphQLString],
      [FieldMetadataType.EMAIL, GraphQLString],
      [FieldMetadataType.DATE, dateScalar],
      [FieldMetadataType.BOOLEAN, GraphQLBoolean],
      [FieldMetadataType.NUMBER, numberScalar],
    ]);

    return typeScalarMapping.get(fieldMetadataType);
  }

  mapToFilterType(
    fieldMetadataType: FieldMetadataType,
    dateScalarMode: DateScalarMode = 'isoDate',
    numberScalarMode: NumberScalarMode = 'float',
  ): GraphQLInputObjectType | GraphQLScalarType<boolean, boolean> | undefined {
    const dateFilter =
      dateScalarMode === 'timestamp' ? DatetimeFilterType : DateFilterType;
    const numberScalar =
      numberScalarMode === 'float' ? FloatFilterType : IntFilterType;

    // URL and MONEY are handled in the factories because they are objects
    const typeFilterMapping = new Map<
      FieldMetadataType,
      GraphQLInputObjectType | GraphQLScalarType<boolean, boolean>
    >([
      [FieldMetadataType.UUID, UUIDFilterType],
      [FieldMetadataType.TEXT, StringFilterType],
      [FieldMetadataType.PHONE, StringFilterType],
      [FieldMetadataType.EMAIL, StringFilterType],
      [FieldMetadataType.DATE, dateFilter],
      [FieldMetadataType.BOOLEAN, BooleanFilterType],
      [FieldMetadataType.NUMBER, numberScalar],
    ]);

    return typeFilterMapping.get(fieldMetadataType);
  }

  mapToOrderByType(
    fieldMetadataType: FieldMetadataType,
  ): GraphQLInputType | undefined {
    // URL and MONEY are handled in the factories because they are objects
    const typeOrderByMapping = new Map<FieldMetadataType, GraphQLEnumType>([
      [FieldMetadataType.UUID, OrderByDirectionType],
      [FieldMetadataType.TEXT, OrderByDirectionType],
      [FieldMetadataType.PHONE, OrderByDirectionType],
      [FieldMetadataType.EMAIL, OrderByDirectionType],
      [FieldMetadataType.DATE, OrderByDirectionType],
      [FieldMetadataType.BOOLEAN, OrderByDirectionType],
      [FieldMetadataType.NUMBER, OrderByDirectionType],
    ]);

    return typeOrderByMapping.get(fieldMetadataType);
  }

  mapToGqlType<T extends GraphQLType = GraphQLType>(
    typeRef: T,
    options: TypeOptions,
  ): T {
    let graphqlType: T | GraphQLList<T> | GraphQLNonNull<T> = typeRef;

    if (options.isArray) {
      graphqlType = this.mapToGqlList(
        graphqlType,
        options.arrayDepth ?? 1,
        options.nullable ?? false,
      );
    }

    if (!options.nullable) {
      graphqlType = new GraphQLNonNull(graphqlType) as unknown as T;
    }

    return graphqlType as T;
  }

  private mapToGqlList<T extends GraphQLType = GraphQLType>(
    targetType: T,
    depth: number,
    nullable: boolean,
  ): GraphQLList<T> {
    const targetTypeNonNull = nullable
      ? targetType
      : new GraphQLNonNull(targetType);

    if (depth === 0) {
      return targetType as GraphQLList<T>;
    }

    return this.mapToGqlList<T>(
      new GraphQLList(targetTypeNonNull) as unknown as T,
      depth - 1,
      nullable,
    );
  }
}
