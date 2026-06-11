import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  color,
  FONT_WEIGHT,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button, ExternalLink, MarkedDivider } from '@/ui';

import { FOOTER, type FooterNavGroup } from './footer.data';

const NavGrid = styled.nav`
  margin-block: ${spacing(10)};

  ${mediaUp('md')} {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  }
`;

const GroupDividerSlot = styled.div`
  width: 100%;

  ${mediaUp('md')} {
    height: 100%;
    margin-inline: ${spacing(7)};
    width: auto;
  }
`;

const Group = styled.div`
  margin-block: ${spacing(4)};

  ${mediaUp('md')} {
    margin-block: 0 ${spacing(7)};
  }
`;

const GroupTitle = styled.h4`
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.35;
  margin-bottom: ${spacing(2)};
`;

const LinkList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const HoverMarker = styled.span`
  background-color: ${semanticColor.ink};
  border-radius: 1px;
  display: inline-flex;
  flex-shrink: 0;
  height: 7px;
  opacity: 0;
  transition:
    width 0.3s ease-out,
    opacity 0.3s ease-out;
  width: 0;
`;

const linkStyles = `
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  font-size: ${fontSize(4)};
  gap: 0;
  line-height: 1.35;
  text-decoration: none;
  transition: gap 0.3s ease-out;

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

const InternalLink = styled(LocalizedLink)`
  ${linkStyles}
`;

const ExternalNavLink = styled(ExternalLink)`
  ${linkStyles}
`;

const CtaColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  margin-top: ${spacing(8)};

  & > * {
    width: 126px;
  }
`;

function GroupBlock({ group }: { group: FooterNavGroup }) {
  const i18n = getServerI18n();

  return (
    <Group aria-labelledby={group.id} role="group">
      <GroupTitle id={group.id}>{i18n._(group.title)}</GroupTitle>
      <LinkList>
        {group.links.map((link) => (
          <li key={link.href}>
            {link.external === true ? (
              <ExternalNavLink href={link.href}>
                <HoverMarker aria-hidden data-slot="hover-marker" />
                {i18n._(link.label)}
              </ExternalNavLink>
            ) : (
              <InternalLink href={link.href}>
                <HoverMarker aria-hidden data-slot="hover-marker" />
                {i18n._(link.label)}
              </InternalLink>
            )}
          </li>
        ))}
      </LinkList>
      {group.ctas !== undefined && (
        <CtaColumn>
          {group.ctas.map((cta) => (
            <Button
              href={cta.href}
              key={cta.href}
              label={i18n._(cta.label)}
              variant={cta.variant}
            />
          ))}
        </CtaColumn>
      )}
    </Group>
  );
}

export function FooterNav() {
  return (
    <NavGrid>
      {FOOTER.navGroups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && (
            <GroupDividerSlot>
              <MarkedDivider />
            </GroupDividerSlot>
          )}
          <GroupBlock group={group} />
        </Fragment>
      ))}
    </NavGrid>
  );
}
