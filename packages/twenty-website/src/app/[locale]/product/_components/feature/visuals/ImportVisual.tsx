'use client';

import { styled } from '@linaria/react';

import {
  CARD_ACCENT,
  CARD_BG,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from './visual-tokens';

const Root = styled.div`
  background: ${CARD_BG};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  padding: 16px;
  width: 100%;
`;

const PageTitle = styled.h4`
  color: ${CARD_TEXT};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px;
`;

const PageDescription = styled.p`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 11px;
  line-height: 1.5;
  margin: 0 0 16px;
`;

const TableFrame = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const TableHeaderRow = styled.div`
  display: flex;
  padding: 8px 12px;
`;

const NameHeader = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex: 1;
  font-size: 11px;
  font-weight: 500;
`;

const RightsHeader = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 11px;
  font-weight: 500;
  text-align: right;
  width: 130px;
`;

const SectionRow = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid ${CARD_BORDER};
  border-top: 1px solid ${CARD_BORDER};
  display: flex;
  gap: 6px;
  padding: 6px 12px;
`;

const SectionLabel = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  font-size: 10px;
  font-weight: 500;
`;

const SectionChevron = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  margin-left: auto;
`;

const TableBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

const Row = styled.div`
  align-items: center;
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  padding: 8px 12px;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const RoleIconEl = styled.div`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  height: 18px;
  justify-content: center;
  margin-right: 8px;
  width: 18px;
`;

const RoleName = styled.span`
  color: ${CARD_TEXT};
  flex: 1;
  font-size: 12px;
  font-weight: 500;
`;

const RightsGroup = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  width: 130px;
  justify-content: flex-end;
`;

const RightIcon = styled.div`
  align-items: center;
  border: 1px solid ${CARD_ACCENT};
  border-radius: 4px;
  color: ${CARD_ACCENT};
  display: flex;
  height: 18px;
  justify-content: center;
  width: 18px;
`;

const RowChevron = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  margin-left: 8px;
`;

const ROLES = [
  { name: 'CMO', icons: 4 },
  { name: 'Product Marketing Manager', icons: 4 },
  { name: 'Digital Marketing Manager', icons: 4 },
  { name: 'Content Marketing Manager', icons: 4 },
  { name: 'CEO', icons: 4 },
];

const ICON_PATHS = [
  'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
];

type ImportVisualProps = {
  active: boolean;
};

export function ImportVisual({ active: _active }: ImportVisualProps) {
  return (
    <Root>
      <PageTitle>Permissions</PageTitle>
      <PageDescription>
        Customise the fields available in the company views and their display
        order in the company detail view.
      </PageDescription>

      <TableFrame>
        <TableHeaderRow>
          <NameHeader>Name</NameHeader>
          <RightsHeader>Rights</RightsHeader>
        </TableHeaderRow>

        <SectionRow>
          <SectionLabel>Have Access</SectionLabel>
          <SectionChevron>
            <svg
              fill="none"
              height="10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              viewBox="0 0 10 10"
              width="10"
            >
              <path d="M3 4l2 2 2-2" />
            </svg>
          </SectionChevron>
        </SectionRow>

        <TableBody>
          {ROLES.map((role, index) => (
            <Row key={index}>
              <RoleIconEl>
                <svg
                  fill="none"
                  height="14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="14"
                >
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </RoleIconEl>
              <RoleName>{role.name}</RoleName>
              <RightsGroup>
                {ICON_PATHS.map((path, iconIdx) => (
                  <RightIcon key={iconIdx}>
                    <svg
                      fill="none"
                      height="10"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                      width="10"
                    >
                      <path d={path} />
                    </svg>
                  </RightIcon>
                ))}
              </RightsGroup>
              <RowChevron>
                <svg
                  fill="none"
                  height="12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  viewBox="0 0 10 10"
                  width="12"
                >
                  <path d="M4 2l3 3-3 3" />
                </svg>
              </RowChevron>
            </Row>
          ))}
        </TableBody>
      </TableFrame>
    </Root>
  );
}
