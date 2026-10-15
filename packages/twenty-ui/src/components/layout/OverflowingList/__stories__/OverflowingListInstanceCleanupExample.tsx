import { useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';

export const OverflowingListInstanceCleanupExample = () => {
  const [showCompanyList, setShowCompanyList] = useState(true);

  return (
    <Section.Root>
      {showCompanyList && (
        <OverflowingList
          maxInlineCount={1}
          showOverflowCount
          overflowLabel="Company items"
          style={{ width: 180 }}
        >
          <Tag key="company" color="blue">
            Company
          </Tag>
          <Button key="remove" onClick={() => setShowCompanyList(false)}>
            Remove company list
          </Button>
          <Tag key="deal" color="green">
            Deal
          </Tag>
        </OverflowingList>
      )}
      <OverflowingList
        maxInlineCount={1}
        showOverflowCount
        overflowLabel="Person items"
        style={{ width: 180 }}
      >
        {OVERFLOWING_LIST_STORY_ITEMS}
      </OverflowingList>
    </Section.Root>
  );
};
