import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Button } from '@/ui';

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
  const i18n = getServerI18n();

  return (
    <Row>
      <Button href="/partners/brief" label={i18n._(msg`Get matched`)} />
      <BrowseDirectoryButton />
    </Row>
  );
}
