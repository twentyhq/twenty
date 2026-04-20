'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ActivationResult = {
  enterpriseKey: string;
  licensee: string;
  subscriptionId: string;
};

const PageWrap = styled.div`
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  margin-top: ${theme.spacing(12)};
  max-width: 700px;
  min-height: 60vh;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
`;

const Title = styled.h1`
  font-size: ${theme.font.size(8)};
  font-weight: 600;
  margin-bottom: ${theme.spacing(4)};
`;

const ErrorBox = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.accent.pink[70]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.accent.pink[100]};
  padding: ${theme.spacing(4)};
`;

const SuccessLead = styled.p`
  color: ${theme.colors.accent.green[100]};
  margin-bottom: ${theme.spacing(4)};
`;

const LicenseeRow = styled.div`
  margin-bottom: ${theme.spacing(6)};
`;

const KeyLabel = styled.div`
  font-weight: 600;
  margin-bottom: ${theme.spacing(2)};
`;

const KeyHint = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(3)};
  margin-bottom: ${theme.spacing(2)};
`;

const KeyBlock = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2)};
  line-height: 1.5;
  padding: ${theme.spacing(4)};
  padding-right: ${theme.spacing(16)};
  position: relative;
  word-break: break-all;
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  background-color: ${({ $copied }) =>
    $copied ? theme.colors.accent.green[100] : theme.colors.primary.text[100]};
  border: none;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.background[100]};
  cursor: pointer;
  font-size: ${theme.font.size(2)};
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
  position: absolute;
  right: ${theme.spacing(2)};
  top: ${theme.spacing(2)};
`;

const NextStepsBox = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.accent.blue[70]};
  border-radius: ${theme.radius(2)};
  margin-top: ${theme.spacing(8)};
  padding: ${theme.spacing(4)};
`;

const NextStepsList = styled.ol`
  line-height: 1.75;
  margin-top: ${theme.spacing(2)};
  padding-left: ${theme.spacing(5)};
`;

export function EnterpriseActivateClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please complete the checkout first.');
      setLoading(false);

      return;
    }

    const activate = async () => {
      try {
        const response = await fetch(
          `/api/enterprise/activate?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data: { error?: string } & Partial<ActivationResult> =
          await response.json();

        if (!response.ok) {
          setError(data.error ?? 'Activation failed');

          return;
        }

        if (data.enterpriseKey && data.licensee && data.subscriptionId) {
          setResult({
            enterpriseKey: data.enterpriseKey,
            licensee: data.licensee,
            subscriptionId: data.subscriptionId,
          });
        } else {
          setError('Activation response was incomplete.');
        }
      } catch {
        setError('Failed to activate enterprise key. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void activate();
  }, [sessionId]);

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.enterpriseKey);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <PageWrap>
      <Title>{'Enterprise activation'}</Title>

      {loading && <p>{'Activating your enterprise license…'}</p>}

      {error !== null && <ErrorBox>{error}</ErrorBox>}

      {result !== null && (
        <div>
          <SuccessLead>
            {'Your enterprise license has been activated successfully.'}
          </SuccessLead>

          <LicenseeRow>
            <strong>{'Licensee:'}</strong> {result.licensee}
          </LicenseeRow>

          <KeyLabel>{'Your enterprise key'}</KeyLabel>
          <KeyHint>
            {
              'Copy this key and paste it into your Twenty self-hosted instance settings.'
            }
          </KeyHint>

          <KeyBlock>
            {result.enterpriseKey}
            <CopyButton
              $copied={copied}
              onClick={() => void handleCopy()}
              type="button"
            >
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </KeyBlock>

          <NextStepsBox>
            <strong>{'Next steps'}</strong>
            <NextStepsList>
              <li>{'Copy the enterprise key above.'}</li>
              <li>
                {'Open your Twenty self-hosted instance Settings → Enterprise.'}
              </li>
              <li>{'Paste the key and click Activate.'}</li>
            </NextStepsList>
          </NextStepsBox>
        </div>
      )}
    </PageWrap>
  );
}
