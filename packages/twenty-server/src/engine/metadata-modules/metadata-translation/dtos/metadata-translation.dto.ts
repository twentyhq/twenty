import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum MetadataTranslationProvenance {
  WORKSPACE = 'WORKSPACE',
  SHIPPED = 'SHIPPED',
  INHERITED = 'INHERITED',
}

registerEnumType(MetadataTranslationProvenance, {
  name: 'MetadataTranslationProvenance',
  description:
    'Where a resolved metadata label comes from: a workspace-authored translation, a shipped application catalog, or inheritance from the canonical value',
});

@ObjectType('MetadataTranslation')
export class MetadataTranslationDTO {
  @Field()
  metadataName: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string | null;

  @Field()
  property: string;

  @Field()
  locale: string;

  @Field()
  sourceValue: string;

  @Field()
  canonicalValue: string;

  @Field()
  value: string;

  @Field(() => MetadataTranslationProvenance)
  provenance: MetadataTranslationProvenance;
}
