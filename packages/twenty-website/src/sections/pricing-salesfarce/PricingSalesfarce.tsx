import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { SALESFARCE_DATA } from './salesfarce-data';
import { SalesfarceFlow } from './SalesfarceFlow';

const COMPARE_LINKS = [
  { label: msg`Twenty vs HubSpot`, href: '/compare-pricing/hubspot' },
  { label: msg`Twenty vs Salesforce`, href: '/compare-pricing/salesforce' },
  {
    label: msg`Twenty vs SAP Sales Cloud`,
    href: '/compare-pricing/sap-sales-cloud',
  },
  { label: msg`Twenty vs Pipedrive`, href: '/compare-pricing/pipedrive' },
  {
    label: msg`Twenty vs Microsoft Dynamics`,
    href: '/compare-pricing/microsoft-dynamics',
  },
  // Attio comparison parked, may return:
  // { label: msg`Twenty vs Attio`, href: '/compare-pricing/attio' },
];

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 400px) minmax(0, 672px);
    justify-content: space-between;

    & > * + * {
      margin-top: 0;
    }
  }
`;

const CopyColumn = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${mediaUp('md')} {
    align-self: center;
  }
`;

const CompareList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  list-style: none;
  margin-top: ${spacing(6)};
  padding: 0;
`;

// The footer's hover-marker link affordance, so the list reads as the same
// navigation language.
const HoverMarker = styled.span`
  background-color: ${semanticColor.ink};
  border-radius: 1px;
  display: inline-flex;
  flex-shrink: 0;
  height: 7px;
  opacity: 0;
  transition:
    width ${DURATION.md} ease-out,
    opacity ${DURATION.md} ease-out;
  width: 0;
`;

const CompareLink = styled(LocalizedLink)`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  font-size: ${fontSize(4)};
  gap: 0;
  line-height: 1.35;
  text-decoration: none;
  transition: gap ${DURATION.md} ease-out;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  ${mediaUp('md')} {
    &:hover {
      gap: ${spacing(2)};
    }

    &:hover [data-slot='hover-marker'] {
      opacity: 1;
      width: 14px;
    }
  }
`;

export function PricingSalesfarce() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="muted">
      <Grid>
        <CopyColumn>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Compare *the real cost*`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(SALESFARCE_DATA.body)}
          </Body>
          <CompareList>
            {COMPARE_LINKS.map((link) => (
              <li key={link.href}>
                <CompareLink href={link.href}>
                  <HoverMarker aria-hidden data-slot="hover-marker" />
                  {i18n._(link.label)}
                </CompareLink>
              </li>
            ))}
          </CompareList>
        </CopyColumn>
        <SalesfarceFlow pricing={SALESFARCE_DATA.pricing} />
      </Grid>
    </SectionShell>
  );
}
