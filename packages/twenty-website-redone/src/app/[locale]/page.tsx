import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { TrustedBy } from '@/sections/trusted-by';
import { spacing } from '@/tokens';
import { Body, Button, Eyebrow, Heading, SectionShell } from '@/ui';

export const generateMetadata = buildRouteMetadata('home');

const ProofStack = styled.div`
  display: grid;
  gap: ${spacing(6)};
  justify-items: start;
`;

const ProofButtonRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
`;

export default async function HomePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const i18n = await getRouteI18n(params);

  return (
    <main>
      <SectionShell scheme="muted">
        <ProofStack>
          <Eyebrow>{i18n._(msg`In production.`)}</Eyebrow>
          <Heading as="h1" size="xl" weight="light">
            {i18n._(msg`See how teams\nbuild *on Twenty*`)}
          </Heading>
          <Body muted>
            {i18n._(
              msg`Every section sits in the same shell: identical vertical rhythm from tokens, semantic colors resolved by the surface scheme, and the only horizontal gutter on the site.`,
            )}
          </Body>
          <ProofButtonRow>
            <Button href="/" label={i18n._(msg`Get started`)} />
            <Button
              href="https://github.com/twentyhq/twenty"
              label={i18n._(msg`Star us`)}
              variant="outlined"
            />
          </ProofButtonRow>
        </ProofStack>
      </SectionShell>
      <SectionShell ariaLabel="Trusted by leading organizations">
        <TrustedBy />
      </SectionShell>
    </main>
  );
}
