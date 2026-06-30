'use client';

import { useEffect, useState } from 'react';

export type EnterpriseActivationResult = {
  enterpriseKey: string;
  licensee: string;
  subscriptionId: string;
};

// The hook stays presentation-agnostic: it reports a structured error the view
// localizes, rather than baking user-facing English strings into the logic.
export type EnterpriseActivationError =
  | { kind: 'incomplete-response' }
  | { kind: 'missing-session' }
  | { kind: 'request-failed' }
  | { kind: 'service'; message?: string };

export type EnterpriseActivationState = {
  error: EnterpriseActivationError | null;
  loading: boolean;
  result: EnterpriseActivationResult | null;
};

export function useEnterpriseActivation(
  sessionId: string | null,
): EnterpriseActivationState {
  const [result, setResult] = useState<EnterpriseActivationResult | null>(null);
  const [error, setError] = useState<EnterpriseActivationError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError({ kind: 'missing-session' });
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
        const data: { error?: string } & Partial<EnterpriseActivationResult> =
          await response.json();

        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          setError({ kind: 'service', message: data.error });
          return;
        }

        if (data.enterpriseKey && data.licensee && data.subscriptionId) {
          setResult({
            enterpriseKey: data.enterpriseKey,
            licensee: data.licensee,
            subscriptionId: data.subscriptionId,
          });
        } else {
          setError({ kind: 'incomplete-response' });
        }
      } catch {
        if (abortController.signal.aborted) {
          return;
        }
        setError({ kind: 'request-failed' });
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
