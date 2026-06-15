'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type Candidate = {
  applicationId: string;
  state: string;
  pitch: string | null;
  partner: {
    name: string | null;
    skills: string[] | null;
    country: string | null;
  } | null;
};

export type ReviewData =
  | {
      ok: true;
      brief: {
        name: string | null;
        need: string | null;
        requirements: string | null;
        status: string;
      };
      candidates: Candidate[];
      picked: string | null;
    }
  | { ok: false; reason: string };

const Background = styled.div`
  align-items: center;
  background: #0c0c0c;
  display: flex;
  justify-content: center;
  min-height: 100vh;
`;

const Container = styled.div`
  box-sizing: border-box;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  max-width: min(720px, 100%);
  padding: ${theme.spacing(6)} ${theme.spacing(4)};
  width: 100%;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  margin: 0;
`;

const Lede = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(4)};
`;

const CardName = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const Meta = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const PickButton = styled.button`
  align-self: flex-start;
  background: #4a38f5;
  border: 0;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: ${theme.spacing(2)} ${theme.spacing(4)};

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const Selected = styled.div`
  align-self: flex-start;
  color: #89fc9a;
  font-weight: 500;
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  margin: 0;
`;

export function BriefReviewPageContent({
  token,
  data,
}: {
  token: string;
  data: ReviewData;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!data.ok) {
    return (
      <Background>
        <Container>
          <Title>This link is invalid or has expired.</Title>
          <Lede>
            Please check with your Twenty contact for an up-to-date link.
          </Lede>
        </Container>
      </Background>
    );
  }

  const isClosed = data.brief.status === 'CLOSED';

  const pick = async (applicationId: string) => {
    setPendingId(applicationId);
    setError(null);
    try {
      const res = await fetch('/api/brief-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, applicationId }),
      });
      if (!res.ok) {
        setError('Could not record your choice. Please try again.');
        setPendingId(null);
        return;
      }
      router.refresh();
    } catch {
      setError('Could not record your choice. Please try again.');
      setPendingId(null);
    }
  };

  return (
    <Background>
      <Container>
        <Title>{data.brief.name ?? 'Your brief'}</Title>
        {data.brief.need ? <Lede>{data.brief.need}</Lede> : null}
        {isClosed ? (
          <Lede>A partner has been selected — this review is now locked.</Lede>
        ) : null}
        {data.candidates.map((candidate) => (
          <Card key={candidate.applicationId}>
            <CardName>{candidate.partner?.name ?? 'Partner'}</CardName>
            {candidate.partner?.country ? (
              <Meta>{candidate.partner.country}</Meta>
            ) : null}
            {candidate.partner?.skills?.length ? (
              <Meta>{candidate.partner.skills.join(', ')}</Meta>
            ) : null}
            {candidate.pitch ? <Lede>{candidate.pitch}</Lede> : null}
            {data.picked === candidate.applicationId ? (
              <Selected>Selected</Selected>
            ) : !isClosed ? (
              <PickButton
                disabled={pendingId !== null}
                onClick={() => pick(candidate.applicationId)}
              >
                {pendingId === candidate.applicationId
                  ? 'Saving…'
                  : 'Pick this partner'}
              </PickButton>
            ) : null}
          </Card>
        ))}
        {error ? <ErrorText>{error}</ErrorText> : null}
      </Container>
    </Background>
  );
}
