import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { spacing } from '@/tokens';

import { ClientLogo } from './ClientLogo';
import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerClient } from './marketplace-partner';
import { ProfileSectionTitle } from './ProfileSectionTitle';

const Section = styled.section`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const LogoWall = styled.div`
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 ${spacing(7)},
    #000 calc(100% - ${spacing(7)}),
    transparent
  );
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: ${spacing(8)};
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 ${spacing(7)},
    #000 calc(100% - ${spacing(7)}),
    transparent
  );
  overflow-x: auto;
  padding: ${spacing(1.5)} 0 ${spacing(3.5)};
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ClientItem = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  scroll-snap-align: start;
`;

export function PartnerClients({
  clients,
}: {
  clients: readonly PartnerClient[];
}) {
  const visibleClients = clients.filter(
    (client) => client.logoUrl !== null && isSafeHttpUrl(client.logoUrl),
  );

  if (visibleClients.length === 0) {
    return null;
  }

  const i18n = getServerI18n();

  return (
    <Section aria-labelledby="partner-clients-heading">
      <ProfileSectionTitle id="partner-clients-heading">
        {i18n._(msg`Clients`)}
      </ProfileSectionTitle>
      <LogoWall aria-label={i18n._(msg`Client logos`)}>
        {visibleClients.map((client) => (
          <ClientItem key={client.name}>
            <ClientLogo alt={client.name} src={client.logoUrl!} />
          </ClientItem>
        ))}
      </LogoWall>
    </Section>
  );
}
