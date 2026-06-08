'use client';

import { styled } from '@linaria/react';
import {
  IconArrowRight,
  IconChevronDown,
  IconCirclePlus,
  IconCopy,
  IconLink,
  IconPaperclip,
} from '@tabler/icons-react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  BG_PANEL,
  BORDER_LIGHT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from '../visual-tokens';
import { RelAvatar } from './record-tab-shared';

const EventList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 16px 18px 0;
`;

const MonthSeparator = styled.div`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 12px;
  margin-bottom: 16px;
`;

const MonthSeparatorLine = styled.div`
  background: ${BORDER_LIGHT};
  border-radius: 50px;
  flex: 1;
  height: 1px;
`;

const Group = styled.div`
  position: relative;
`;

const RailBar = styled.div`
  background: ${BG_PANEL};
  border: 1px solid ${BORDER_LIGHT};
  border-radius: 8px;
  bottom: 14px;
  left: 0;
  position: absolute;
  top: 3px;
  width: 24px;
`;

const EventRow = styled.div`
  align-items: center;
  display: flex;
  gap: 14px;
  padding-bottom: 16px;

  &:last-child {
    padding-bottom: 4px;
  }
`;

const EventRail = styled.div`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 24px;
  z-index: 1;

  svg {
    height: 15px;
    width: 15px;
  }
`;

const EventContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 4px;
  min-width: 0;
`;

const EvBold = styled.span`
  color: ${CARD_TEXT};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const EvText = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  flex-shrink: 0;
  font-size: 12px;
  white-space: nowrap;
`;

const EvArrow = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const EvChip = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  color: ${CARD_TEXT};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 12px;
  gap: 4px;
  padding: 1px 5px 1px 3px;
`;

const EvChipChevron = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const EvTime = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 11px;
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
`;

type EventPart = {
  bold?: boolean;
  text?: string;
  chip?: { name: string; avatar: string };
  chevron?: boolean;
  arrow?: boolean;
};

const TIMELINE: {
  icon: typeof IconCopy;
  time: string;
  parts: EventPart[];
}[] = [
  {
    icon: IconCopy,
    time: '2 days ago',
    parts: [
      { bold: true, text: 'Alice' },
      { text: 'edited 3 fields on' },
      {
        chip: {
          name: 'Dario Amodei',
          avatar: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
        },
        chevron: true,
      },
    ],
  },
  {
    icon: IconPaperclip,
    time: '12 days ago',
    parts: [
      { bold: true, text: 'Tim Cook' },
      { text: 'updated' },
      { bold: true, text: 'Owner' },
      { arrow: true },
      {
        chip: {
          name: 'Patrick Collison',
          avatar: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
        },
      },
    ],
  },
  {
    icon: IconLink,
    time: '23 days ago',
    parts: [
      { bold: true, text: 'Tim Cook' },
      { text: 'linked' },
      {
        chip: {
          name: 'Dario Amodei',
          avatar: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
        },
      },
      { text: 'to' },
      { bold: true, text: 'Anthropic' },
    ],
  },
  {
    icon: IconCirclePlus,
    time: '42 days ago',
    parts: [
      { bold: true, text: 'Anthropic' },
      { text: 'was created by' },
      { bold: true, text: 'Tim Cook' },
    ],
  },
];

export function TimelineTab() {
  return (
    <EventList>
      <MonthSeparator>
        July
        <MonthSeparatorLine />
      </MonthSeparator>
      <Group>
        <RailBar />
        {TIMELINE.map((event, index) => {
          const EventIcon = event.icon;
          return (
            <EventRow key={index}>
              <EventRail>
                <EventIcon />
              </EventRail>
              <EventContent>
                {event.parts.map((part, partIndex) => {
                  if (part.chip) {
                    return (
                      <EvChip key={partIndex}>
                        <RelAvatar alt="" src={part.chip.avatar} />
                        {part.chip.name}
                        {part.chevron ? (
                          <EvChipChevron>
                            <IconChevronDown />
                          </EvChipChevron>
                        ) : null}
                      </EvChip>
                    );
                  }
                  if (part.arrow) {
                    return (
                      <EvArrow key={partIndex}>
                        <IconArrowRight />
                      </EvArrow>
                    );
                  }
                  if (part.bold) {
                    return <EvBold key={partIndex}>{part.text}</EvBold>;
                  }
                  return <EvText key={partIndex}>{part.text}</EvText>;
                })}
                <EvTime>{event.time}</EvTime>
              </EventContent>
            </EventRow>
          );
        })}
      </Group>
    </EventList>
  );
}
