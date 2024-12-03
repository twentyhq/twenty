import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const opportunitiesByStageView = (
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return {
    name: 'By Stage',
    objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].id,
    type: 'kanban',
    key: null,
    position: 1,
    icon: 'IconLayoutKanban',
    kanbanFieldMetadataId:
      objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
        OPPORTUNITY_STANDARD_FIELD_IDS.stage
      ],
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.amount
          ],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.createdBy
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.closeDate
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.company
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact
          ],
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
    groups: [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
      },
    ],
  };
};
