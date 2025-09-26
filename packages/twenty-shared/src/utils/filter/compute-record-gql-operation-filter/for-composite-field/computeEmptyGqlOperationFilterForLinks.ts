import {
  type LinksFilter,
  type PartialFieldMetadataItem,
  type RecordGqlOperationFilter,
} from '@/types';

import { type RecordFilterShared } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeEmptyGqlOperationFilterForLinks = ({
  recordFilter,
  correspondingFieldMetadataItem,
  throwCustomError,
}: {
  recordFilter: RecordFilterShared;
  correspondingFieldMetadataItem: Pick<PartialFieldMetadataItem, 'name'>;
  throwCustomError: (message: string, code?: string) => never;
}): RecordGqlOperationFilter => {
  const subFieldName = recordFilter.subFieldName;
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryLinkLabel': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkLabel: { eq: '' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkLabel: { is: 'NULL' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      case 'primaryLinkUrl': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkUrl: { eq: '' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkUrl: { is: 'NULL' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      case 'secondaryLinks': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                secondaryLinks: { is: 'NULL' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                secondaryLinks: { like: '[]' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      default: {
        return throwCustomError( 
          `Unknown subfield name ${subFieldName}`,
          'UNKNOWN_SUBFIELD_NAME',
        );
      }
    }
  }

  return {
    and: [
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkLabel: { eq: '' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkLabel: { is: 'NULL' },
            } satisfies LinksFilter,
          },
        ],
      },
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkUrl: { eq: '' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkUrl: { is: 'NULL' },
            } satisfies LinksFilter,
          },
        ],
      },
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              secondaryLinks: { is: 'NULL' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              secondaryLinks: { like: '[]' },
            } satisfies LinksFilter,
          },
        ],
      },
    ],
  };
};
