import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, Heading, type HeadingLevel } from '@/ui';

const SwitchRow = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(6)};
  display: flex;
  flex-direction: column;
  padding: ${spacing(6)};
  row-gap: ${spacing(4)};

  ${mediaUp('sm')} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SwitchCopy = styled.div`
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

type ProgramStripProps = {
  heading: MessageDescriptor;
  body?: MessageDescriptor;
  action: ReactNode;
  headingLevel?: HeadingLevel;
};

// A row, not a section: it closes the section it is slotted into.
export function ProgramStrip({
  heading,
  body,
  action,
  headingLevel = 'h3',
}: ProgramStripProps) {
  const i18n = getServerI18n();

  return (
    <SwitchRow>
      <SwitchCopy>
        <Heading as={headingLevel} size="xs" weight="regular">
          {i18n._(heading)}
        </Heading>
        {isDefined(body) && (
          <Body muted size="sm">
            {i18n._(body)}
          </Body>
        )}
      </SwitchCopy>
      {action}
    </SwitchRow>
  );
}
