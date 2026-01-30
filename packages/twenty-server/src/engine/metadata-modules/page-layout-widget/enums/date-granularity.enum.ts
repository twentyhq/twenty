import { registerEnumType } from '@nestjs/graphql';

import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

registerEnumType(ObjectRecordGroupByDateGranularity, {
  name: 'ObjectRecordGroupByDateGranularity',
  description:
    'Date granularity options (e.g. DAY, MONTH, QUARTER, YEAR, WEEK, DAY_OF_THE_WEEK, MONTH_OF_THE_YEAR, QUARTER_OF_THE_YEAR)',
});

export { ObjectRecordGroupByDateGranularity };
