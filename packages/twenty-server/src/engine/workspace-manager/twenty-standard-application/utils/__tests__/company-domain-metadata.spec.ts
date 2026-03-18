import { STANDARD_INDEX_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/1-16/constants/standard-index-field-names.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildCompanyStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-company-standard-flat-index-metadata.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { STANDARD_OBJECTS } from '../../../../../../../twenty-shared/src/metadata/constants/standard-object.constant';

describe('company domain metadata', () => {
  const now = '2026-03-18T00:00:00.000Z';
  const workspaceId = 'workspace-id';
  const twentyStandardApplicationId = 'twenty-standard-application-id';

  const buildAllFlatEntityMaps = () =>
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now,
      workspaceId,
      twentyStandardApplicationId,
    }).allFlatEntityMaps;

  const buildCompanyIndexes = () => {
    const standardObjectMetadataRelatedEntityIds =
      getStandardObjectMetadataRelatedEntityIds();

    const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
      now,
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      dependencyFlatEntityMaps: {
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      },
    });

    const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps({
      now,
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      dependencyFlatEntityMaps: {
        flatObjectMetadataMaps,
      },
    });

    return buildCompanyStandardFlatIndexMetadatas({
      now,
      objectName: 'company',
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      dependencyFlatEntityMaps: {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      },
    });
  };

  it('marks the company domain field as non-unique', () => {
    const allFlatEntityMaps = buildAllFlatEntityMaps();

    const companyDomainField =
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.company.fields.domainName.universalIdentifier
      ];

    expect(companyDomainField.isUnique).toBe(false);
  });

  it('does not build a unique company index for the domain field', () => {
    const companyIndexes = buildCompanyIndexes();

    expect(companyIndexes).not.toHaveProperty('domainNameUniqueIndex');
  });

  it('removes the company domain unique index from the standard metadata catalog', () => {
    expect(STANDARD_OBJECTS.company.indexes).not.toHaveProperty(
      'domainNameUniqueIndex',
    );
    expect(STANDARD_INDEX_FIELD_UNIVERSAL_IDENTIFIERS.company).not.toHaveProperty(
      'domainNameUniqueIndex',
    );
  });

  it('keeps domain-based duplicate detection in the company metadata', () => {
    const allFlatEntityMaps = buildAllFlatEntityMaps();

    const companyMetadata =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.company.universalIdentifier
      ];

    expect(companyMetadata.duplicateCriteria).toContainEqual([
      'domainNamePrimaryLinkUrl',
    ]);
  });
});
