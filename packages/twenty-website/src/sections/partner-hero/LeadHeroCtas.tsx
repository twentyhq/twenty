import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { GetMatchedButton } from '@/client-brief';
import { mediaUp, spacing } from '@/tokens';

import { BrowseDirectoryButton } from './BrowseDirectoryButton';

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  justify-content: center;

  ${mediaUp('sm')} {
    flex-direction: row;
  }
`;

export function LeadHeroCtas() {
  return (
    <Row>
      <GetMatchedButton label={msg`Get matched`} />
      <BrowseDirectoryButton />
    </Row>
  );
}
