'use client';

import { useEffect, useState } from 'react';

type ActivationResult = {
  enterpriseKey: string;
  licensee: string;
  subscriptionId: string;
};

type EnterpriseActivationState = {
  error: string | null;
  loading: boolean;
  result: ActivationResult | null;
};

export function useEnterpriseActivation(
  sessionId: string | null,
): EnterpriseActivationState {
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please complete the checkout first.');
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const activate = async () => {
      try {
        const response = await fetch(
          `/api/enterprise/activate?session_id=${encodeURIComponent(sessionId)}`,
          { signal: abortController.signal },
        );
        const data: { error?: string } & Partial<ActivationResult> =
          await response.json();

        if (abortController.signal.aborted) {
          return;
        }

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
        if (abortController.signal.aborted) {
          return;
        }
        setError('Failed to activate enterprise key. Please try again.');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void activate();

    return () => {
      abortController.abort();
    };
  }, [sessionId]);

  return { error, loading, result };
}
