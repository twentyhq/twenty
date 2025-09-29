import {
  type EmailsFilter,
  type PartialFieldMetadataItem,
  type RecordGqlOperationFilter,
} from '@/types';

import { type RecordFilterShared } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeEmptyGqlOperationFilterForEmails = ({
  recordFilter,
  correspondingFieldMetadataItem,
  throwCustomError,
}: {
  recordFilter: RecordFilterShared;
  correspondingFieldMetadataItem: Pick<PartialFieldMetadataItem, 'name' | 'type'>;
  throwCustomError: (message: string, code?: string) => never;
}): RecordGqlOperationFilter => {
  const subFieldName = recordFilter.subFieldName;
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryEmail': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: { eq: '' },
              } satisfies EmailsFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: { is: 'NULL' },
              } satisfies EmailsFilter,
            },
          ],
        };
      }
      case 'additionalEmails': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                additionalEmails: { is: 'NULL' },
              } satisfies EmailsFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                additionalEmails: { like: '[]' },
              } satisfies EmailsFilter,
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
              primaryEmail: { eq: '' },
            } satisfies EmailsFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryEmail: { is: 'NULL' },
            } satisfies EmailsFilter,
          },
        ],
      },
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              additionalEmails: { is: 'NULL' },
            } satisfies EmailsFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              additionalEmails: { like: '[]' },
            } satisfies EmailsFilter,
          },
        ],
      },
    ],
  };
};
