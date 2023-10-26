import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime, GraphQLTimestamp } from '@nestjs/graphql';

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
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

export interface TypeOptions<T = any> {
  nullable?: boolean;
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

    // URL and MONEY are handled in the factories
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

  mapToGqlType<T extends GraphQLType = GraphQLType>(
    typeRef: T,
    options: TypeOptions,
  ): T {
    let graphqlType: T | GraphQLList<T> | GraphQLNonNull<T> = typeRef;

    if (!options.nullable) {
      graphqlType = new GraphQLNonNull(graphqlType);
    }

    return graphqlType as T;
  }
}
