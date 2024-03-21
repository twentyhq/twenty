import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const viewOpportunityFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
          '20202020-8609-4f65-a2d9-44009eb422b5'
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
          '20202020-583e-4642-8533-db761d5fa82f'
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
          '20202020-527e-44d6-b1ac-c4158d307b97'
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
          '20202020-69d4-45f3-9703-690b09fafcf0'
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
          '20202020-8dfb-42fc-92b6-01afb759ed16'
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
  ];
};
