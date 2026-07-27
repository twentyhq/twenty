'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { IconArrowUpRight } from '@tabler/icons-react';
import { styled } from '@linaria/react';

import {
  DURATION,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button, ExternalLink } from '@/ui';

import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerLinks } from './marketplace-partner';
import { collectPartnerLinks } from './collect-partner-links';
import { collectPartnerLinkUrls } from './collect-partner-link-urls';
import { ProfileEyebrow } from './ProfileEyebrow';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const CtaCard = styled.div`
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4.5)};
  padding: ${spacing(6)};
  width: 100%;
`;

const PrimaryAction = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  width: 100%;

  & > a,
  & > button {
    align-self: stretch;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  & > a[data-variant='filled'] [data-slot='content'] {
    justify-content: center;
    white-space: nowrap;
  }
`;

const SubNote = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.03em;
  text-align: center;
`;

const RailLinks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  list-style: none;
  padding: 0;
  width: 100%;
`;

const RailLink = styled(ExternalLink)`
  align-items: center;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(1.5)};
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(2.5)};
  justify-content: space-between;
  min-width: 0;
  padding: ${spacing(2.75)} ${spacing(3)};
  text-decoration: none;
  transition:
    border-color ${DURATION.sm} ease,
    color ${DURATION.sm} ease;

  &:hover {
    border-color: ${semanticColor.ink};
    color: ${semanticColor.ink};
  }
`;

const RailLinkLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RailLinkIcon = styled(IconArrowUpRight)`
  flex-shrink: 0;
  opacity: 0.55;
`;

export function PartnerProfileCtas({
  calendarLink,
  links,
  linkUrls,
}: {
  calendarLink: string;
  links: PartnerLinks;
  linkUrls?: readonly string[];
}) {
  const { i18n } = useLingui();
  const calendarHref = isSafeHttpUrl(calendarLink) ? calendarLink : null;
  const websiteHref =
    links.website !== null && isSafeHttpUrl(links.website)
      ? links.website
      : null;
  const rawLinkEntries =
    linkUrls !== undefined && linkUrls.length > 0
      ? collectPartnerLinkUrls(linkUrls)
      : collectPartnerLinks(links);
  const linkEntries = rawLinkEntries.filter((entry) => {
    if (calendarHref !== null || websiteHref === null) {
      return true;
    }

    return entry.href !== websiteHref;
  });

  return (
    <Wrapper>
      <ProfileEyebrow>{i18n._(msg`Reach out`)}</ProfileEyebrow>
      <CtaCard>
        {calendarHref !== null && (
          <PrimaryAction>
            <Button
              href={calendarHref}
              label={i18n._(msg`Book intro call`)}
              variant="filled"
            />
            <SubNote>{i18n._(msg`30 minutes, no commitment`)}</SubNote>
          </PrimaryAction>
        )}
        {calendarHref === null && websiteHref !== null && (
          <PrimaryAction>
            <Button
              href={websiteHref}
              label={i18n._(msg`Contact`)}
              variant="outlined"
            />
          </PrimaryAction>
        )}
        {linkEntries.length > 0 && (
          <RailLinks>
            {linkEntries.map((link) => (
              <li key={link.href}>
                <RailLink href={link.href} title={link.label}>
                  <RailLinkLabel>{link.label}</RailLinkLabel>
                  <RailLinkIcon aria-hidden="true" size={16} stroke={1.5} />
                </RailLink>
              </li>
            ))}
          </RailLinks>
        )}
        <PrimaryAction>
          <Button
            href="/partners/brief"
            label={i18n._(msg`Submit a brief`)}
            variant="outlined"
          />
        </PrimaryAction>
      </CtaCard>
    </Wrapper>
  );
}
