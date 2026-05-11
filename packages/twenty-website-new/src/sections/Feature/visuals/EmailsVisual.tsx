'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';
import { AVATAR_COLORS, EMAILS } from './emails-visual.data';
import { WindowChrome } from './WindowChrome';

const List = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

const Row = styled.div`
  align-items: flex-start;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  transition: background-color 0.1s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${BORDER_COLOR};
  }

  &:hover {
    background-color: ${BG_PANEL};
  }

  &[data-selected='true'] {
    background-color: rgba(99, 102, 241, 0.08);
  }
`;

const Avatar = styled.span`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  letter-spacing: 0.02em;
  margin-top: 1px;
  width: 28px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const TopRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`;

const Sender = styled.span`
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-unread='true'] {
    color: ${TEXT_PRIMARY};
  }

  &[data-unread='false'] {
    color: ${TEXT_SECONDARY};
    font-weight: 500;
  }
`;

const Time = styled.span`
  color: ${TEXT_MUTED};
  flex-shrink: 0;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
`;

const Subject = styled.span`
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-unread='true'] {
    color: ${TEXT_PRIMARY};
    font-weight: 500;
  }

  &[data-unread='false'] {
    color: ${TEXT_SECONDARY};
  }
`;

const Preview = styled.span`
  color: ${TEXT_MUTED};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadDot = styled.span`
  background-color: #6366f1;
  border-radius: 50%;
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

type EmailsVisualProps = {
  active: boolean;
};

export function EmailsVisual({ active }: EmailsVisualProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <WindowChrome breadcrumb="Contacts" breadcrumbBold="Emails" title="Apple">
      <List>
        {EMAILS.map((email, index) => {
          const avatarColor = AVATAR_COLORS[email.initials] ?? TEXT_MUTED;

          return (
            <Row
              data-selected={selectedIndex === index}
              key={index}
              onClick={() =>
                setSelectedIndex(selectedIndex === index ? null : index)
              }
            >
              <Avatar
                style={{
                  backgroundColor: `${avatarColor}18`,
                  color: avatarColor,
                }}
              >
                {email.initials}
              </Avatar>
              <Content>
                <TopRow>
                  <Sender data-unread={email.unread}>{email.from}</Sender>
                  {email.unread ? <UnreadDot /> : null}
                  <Time>{email.time}</Time>
                </TopRow>
                <Subject data-unread={email.unread}>{email.subject}</Subject>
                <Preview>{email.preview}</Preview>
              </Content>
            </Row>
          );
        })}
      </List>
    </WindowChrome>
  );
}
