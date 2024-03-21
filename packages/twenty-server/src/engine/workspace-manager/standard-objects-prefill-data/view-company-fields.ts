import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const viewCompanyFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-4d99-4e2e-a84c-4a27837b1ece'
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-0c28-43d8-8ba5-3659924d3489'
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 100,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-95b8-4e10-9881-edb5d4765f9d'
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-66ac-4502-9975-e4d959c50311'
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-8965-464a-8a75-74bafc152a0b'
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-ebeb-4beb-b9ad-6848036fb451'
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 170,
    },
    {
      fieldMetadataId:
        objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].fields[
          '20202020-a82a-4ee2-96cc-a18a3259d953'
        ],
      viewId: viewId,
      position: 6,
      isVisible: true,
      size: 170,
    },
  ];
};
