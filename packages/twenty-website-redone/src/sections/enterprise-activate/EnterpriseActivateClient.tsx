'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '@/tokens';
import { Body, Button, Heading } from '@/ui';

import {
  type EnterpriseActivationError,
  useEnterpriseActivation,
} from './use-enterprise-activation';

const COPIED_RESET_MS = 2000;

const ContentStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const ErrorBox = styled.div`
  background-color: ${color('black-5')};
  border: 1px solid ${color('error')};
  border-radius: ${radius(2)};
  color: ${color('error')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.55;
  padding: ${spacing(4)};
`;

const successLeadClassName = css`
  color: ${color('green')};
`;

const LicenseeLabel = styled.span`
  font-weight: ${FONT_WEIGHT.medium};
`;

const KeySection = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const KeyBlock = styled.div`
  background-color: ${color('black-5')};
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  line-height: 1.5;
  padding: ${spacing(4)};
  padding-right: ${spacing(16)};
  position: relative;
  word-break: break-all;
`;

const CopySlot = styled.span`
  position: absolute;
  right: ${spacing(2)};
  top: ${spacing(2)};
`;

const NextStepsBox = styled.div`
  background-color: ${color('black-5')};
  border: 1px solid ${color('black-20')};
  border-left: 3px solid ${color('blue')};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  padding: ${spacing(4)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const NextStepsList = styled.ol`
  display: flex;
  flex-direction: column;
  list-style-position: outside;
  padding-left: ${spacing(5)};

  & > * + * {
    margin-top: ${spacing(2)};
  }

  & > li::marker {
    color: ${color('black-60')};
    font-weight: ${FONT_WEIGHT.medium};
  }
`;

export function EnterpriseActivateClient() {
  const { i18n } = useLingui();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { result, error, loading } = useEnterpriseActivation(sessionId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeoutId = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    if (!result) {
      return;
    }
    await navigator.clipboard.writeText(result.enterpriseKey);
    setCopied(true);
  };

  const resolveErrorMessage = (
    activationError: EnterpriseActivationError,
  ): string => {
    switch (activationError.kind) {
      case 'missing-session':
        return i18n._(
          msg`No session ID provided. Please complete the checkout first.`,
        );
      case 'request-failed':
        return i18n._(
          msg`Failed to activate enterprise key. Please try again.`,
        );
      case 'incomplete-response':
        return i18n._(msg`Activation response was incomplete.`);
      case 'service':
        return (
          activationError.message ??
          i18n._(msg`Activation failed. Please try again.`)
        );
    }
  };

  return (
    <ContentStack>
      {loading ? (
        <Body size="sm">
          {i18n._(msg`Activating your enterprise license…`)}
        </Body>
      ) : null}

      {error !== null ? (
        <ErrorBox>{resolveErrorMessage(error)}</ErrorBox>
      ) : null}

      {result !== null ? (
        <>
          <Body className={successLeadClassName} size="md" weight="medium">
            {i18n._(
              msg`Your enterprise license has been activated successfully.`,
            )}
          </Body>

          <Body size="sm">
            <LicenseeLabel>{i18n._(msg`Licensee:`)}</LicenseeLabel>{' '}
            {result.licensee}
          </Body>

          <KeySection>
            <Heading as="h2" family="sans" size="xs" weight="medium">
              {i18n._(msg`Your enterprise key`)}
            </Heading>
            <Body size="sm">
              {i18n._(
                msg`Copy this key and paste it into your Twenty self-hosted instance settings.`,
              )}
            </Body>
            <KeyBlock>
              {result.enterpriseKey}
              <CopySlot>
                <Button
                  label={i18n._(copied ? msg`Copied!` : msg`Copy`)}
                  leadingIcon={
                    copied ? (
                      <IconCheck size={14} stroke={2} />
                    ) : (
                      <IconCopy size={14} stroke={2} />
                    )
                  }
                  size="small"
                  variant="filled"
                  onClick={() => void handleCopy()}
                />
              </CopySlot>
            </KeyBlock>
          </KeySection>

          <NextStepsBox>
            <Heading as="h3" family="sans" size="xs" weight="medium">
              {i18n._(msg`Next steps`)}
            </Heading>
            <NextStepsList>
              <li>
                <Body size="sm">
                  {i18n._(msg`Copy the enterprise key above.`)}
                </Body>
              </li>
              <li>
                <Body size="sm">
                  {i18n._(
                    msg`Open your Twenty self-hosted instance Settings → Enterprise.`,
                  )}
                </Body>
              </li>
              <li>
                <Body size="sm">
                  {i18n._(msg`Paste the key and click Activate.`)}
                </Body>
              </li>
            </NextStepsList>
          </NextStepsBox>
        </>
      ) : null}
    </ContentStack>
  );
}
