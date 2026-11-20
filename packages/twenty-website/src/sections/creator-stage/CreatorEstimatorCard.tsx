import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { CreatorApplyButton } from './CreatorApplyButton';
import { CreatorEstimator } from './CreatorEstimator';

// The page's key card (Thomas: right after the hero, and again at the end as
// the closing): what you earn, and the button to start.
const Card = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(6)};

  & > * + * {
    border-top: 1px solid ${semanticColor.line};
    margin-top: ${spacing(8)};
    padding-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(10)};
  }
`;

const Head = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    align-items: end;
    column-gap: ${spacing(10)};
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;

    & > * + * {
      margin-top: 0;
    }
  }
`;

const HeadCopy = styled.div`
  max-width: 560px;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Notes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(10)};
  justify-content: space-between;
`;

const Note = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.5;
  max-width: 560px;
`;

// PROTOTYPE section 2: the earnings estimate as one card.
export function CreatorEstimatorCard() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Card>
        <Head>
          <HeadCopy>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`Earn 20% *for 12 months*`)}
            </Heading>
            <Body muted size="sm">
              {i18n._(
                msg`Of seat revenue on Cloud Organization and Enterprise plans, per customer, counted from their first payment.`,
              )}
            </Body>
          </HeadCopy>
          <div>
            <CreatorApplyButton />
          </div>
        </Head>
        <CreatorEstimator />
        <Notes>
          <Note>
            {i18n._(
              msg`Estimate, on the Organization plan at $39 per seat per month, billed yearly. Paid monthly from $50, after a 30-day hold.`,
            )}
          </Note>
        </Notes>
      </Card>
    </SectionShell>
  );
}
