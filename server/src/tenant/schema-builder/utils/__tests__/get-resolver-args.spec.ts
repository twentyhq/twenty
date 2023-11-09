import { ResolverBuilderMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';

import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { InputTypeDefinitionKind } from 'src/tenant/schema-builder/factories/input-type-definition.factory';
import { getResolverArgs } from 'src/tenant/schema-builder/utils/get-resolver-args.util';

describe('getResolverArgs', () => {
  const expectedOutputs = {
    findMany: {
      first: { type: FieldMetadataType.NUMBER, isNullable: true },
      last: { type: FieldMetadataType.NUMBER, isNullable: true },
      before: { type: FieldMetadataType.TEXT, isNullable: true },
      after: { type: FieldMetadataType.TEXT, isNullable: true },
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: true },
      orderBy: { kind: InputTypeDefinitionKind.OrderBy, isNullable: true },
    },
    findOne: {
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: false },
    },
    createMany: {
      data: {
        kind: InputTypeDefinitionKind.Create,
        isNullable: false,
        isArray: true,
      },
    },
    createOne: {
      data: { kind: InputTypeDefinitionKind.Create, isNullable: false },
    },
    updateOne: {
      id: { type: FieldMetadataType.UUID, isNullable: false },
      data: { kind: InputTypeDefinitionKind.Update, isNullable: false },
    },
    deleteOne: {
      id: { type: FieldMetadataType.UUID, isNullable: false },
    },
  };

  // Test each resolver type
  Object.entries(expectedOutputs).forEach(([resolverType, expectedOutput]) => {
    it(`should return correct args for ${resolverType} resolver`, () => {
      expect(
        getResolverArgs(resolverType as ResolverBuilderMethodNames),
      ).toEqual(expectedOutput);
    });
  });

  // Test for an unknown resolver type
  it('should throw an error for an unknown resolver type', () => {
    const unknownType = 'unknownType';
    expect(() =>
      getResolverArgs(unknownType as ResolverBuilderMethodNames),
    ).toThrow(`Unknown resolver type: ${unknownType}`);
  });
});
