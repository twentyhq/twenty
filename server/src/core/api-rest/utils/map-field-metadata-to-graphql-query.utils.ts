const DEFAULT_DEPTH_VALUE = 2;

export const mapFieldMetadataToGraphqlQuery = (
  objectMetadataItems,
  field,
  maxDepthForRelations = DEFAULT_DEPTH_VALUE,
): any => {
  if (maxDepthForRelations <= 0) {
    return '';
  }

  const fieldType = field.type;

  const fieldIsSimpleValue = [
    'UUID',
    'TEXT',
    'PHONE',
    'DATE_TIME',
    'EMAIL',
    'NUMBER',
    'BOOLEAN',
  ].includes(fieldType);

  if (fieldIsSimpleValue) {
    return field.name;
  } else if (
    fieldType === 'RELATION' &&
    field.toRelationMetadata?.relationType === 'ONE_TO_MANY'
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
    );

    return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .filter((field) => field.type !== 'RELATION')
        .map((field) =>
          mapFieldMetadataToGraphqlQuery(
            objectMetadataItems,
            field,
            maxDepthForRelations - 1,
          ),
        )
        .join('\n')}
    }`;
  } else if (
    fieldType === 'RELATION' &&
    field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
    );

    return `${field.name}
      {
        edges {
          node {
            id
            ${(relationMetadataItem?.fields ?? [])
              .filter((field) => field.type !== 'RELATION')
              .map((field) =>
                mapFieldMetadataToGraphqlQuery(
                  objectMetadataItems,
                  field,
                  maxDepthForRelations - 1,
                ),
              )
              .join('\n')}
          }
        }
      }`;
  } else if (fieldType === 'LINK') {
    return `
      ${field.name}
      {
        label
        url
      }
    `;
  } else if (fieldType === 'CURRENCY') {
    return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
  } else if (fieldType === 'FULL_NAME') {
    return `
      ${field.name}
      {
        firstName
        lastName
      }
    `;
  }
};
