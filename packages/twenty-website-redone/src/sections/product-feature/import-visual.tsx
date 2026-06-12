import { styled } from '@linaria/react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const card = PRODUCT_FEATURE_SCENE.card;

const Root = styled.div`
  background: ${card.background};
  display: flex;
  flex-direction: column;
  font-family: ${card.font};
  height: 100%;
  overflow: hidden;
  padding: 16px;
  width: 100%;
`;

const PageTitle = styled.h4`
  color: ${card.text};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px;
`;

const PageDescription = styled.p`
  color: ${card.textTertiary};
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
  color: ${card.textTertiary};
  flex: 1;
  font-size: 11px;
  font-weight: 500;
`;

const RightsHeader = styled.span`
  color: ${card.textTertiary};
  font-size: 11px;
  font-weight: 500;
  text-align: right;
  width: 130px;
`;

const SectionRow = styled.div`
  align-items: center;
  background: ${card.rowHoverWash};
  border-bottom: 1px solid ${card.border};
  border-top: 1px solid ${card.border};
  display: flex;
  gap: 6px;
  padding: 6px 12px;
`;

const SectionLabel = styled.span`
  color: ${card.textSecondary};
  font-size: 10px;
  font-weight: 500;
`;

const SectionChevron = styled.span`
  color: ${card.textTertiary};
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
  border-bottom: 1px solid ${card.border};
  display: flex;
  padding: 8px 12px;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${card.rowHoverWash};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const RoleIconSlot = styled.div`
  align-items: center;
  color: ${card.textTertiary};
  display: flex;
  flex-shrink: 0;
  height: 18px;
  justify-content: center;
  margin-right: 8px;
  width: 18px;
`;

const RoleName = styled.span`
  color: ${card.text};
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
  border: 1px solid ${card.accent};
  border-radius: 4px;
  color: ${card.accent};
  display: flex;
  height: 18px;
  justify-content: center;
  width: 18px;
`;

const RowChevron = styled.span`
  color: ${card.textTertiary};
  display: inline-flex;
  margin-left: 8px;
`;

// Mock fiction roles (product-screenshot copy, English).
const ROLES = [
  { name: 'CMO' },
  { name: 'Product Marketing Manager' },
  { name: 'Digital Marketing Manager' },
  { name: 'Content Marketing Manager' },
  { name: 'CEO' },
];

// The per-role rights glyphs (authored artwork, verbatim): view, edit,
// delete, export.
const RIGHT_ICON_PATHS = [
  'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
];

// Static visual (the `active` flag drives nothing here, as on the old
// site). NOTE: renders a Permissions table under the "Data import" tile —
// the old site's own content; flagged for a content pass.
export function ImportVisual({ active: _active }: { active: boolean }) {
  const roles = ROLES.map((role, roleNumber) => ({ role, roleNumber }));
  const rightIcons = RIGHT_ICON_PATHS.map((path, iconNumber) => ({
    iconNumber,
    path,
  }));

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
          {roles.map(({ role, roleNumber }) => (
            <Row key={roleNumber}>
              <RoleIconSlot>
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
              </RoleIconSlot>
              <RoleName>{role.name}</RoleName>
              <RightsGroup>
                {rightIcons.map(({ iconNumber, path }) => (
                  <RightIcon key={iconNumber}>
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
