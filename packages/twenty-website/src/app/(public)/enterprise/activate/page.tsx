'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ContentContainer } from '@/app/_components/ui/layout/ContentContainer';

type ActivationResult = {
  enterpriseKey: string;
  licensee: string;
  subscriptionId: string;
};

export default function EnterpriseActivatePage() {
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
          `/api/enterprise/activate?session_id=${sessionId}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Activation failed');

          return;
        }

        setResult(data);
      } catch {
        setError('Failed to activate enterprise key. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [sessionId]);

  const handleCopy = async () => {
    if (!result) return;

    await navigator.clipboard.writeText(result.enterpriseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ContentContainer>
      <div style={{ minHeight: '60vh', marginTop: '50px', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Enterprise Activation
        </h1>

        {loading && <p>Activating your enterprise license...</p>}

        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div>
            <p style={{ marginBottom: '1rem', color: '#16a34a' }}>
              Your enterprise license has been activated successfully.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Licensee:</strong> {result.licensee}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Your Enterprise Key:</strong>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
              }}
            >
              Copy this key and paste it into your Twenty self-hosted instance
              settings.
            </p>

            <div
              style={{
                position: 'relative',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                lineHeight: '1.5',
              }}
            >
              {result.enterpriseKey}
              <button
                onClick={handleCopy}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  background: copied ? '#16a34a' : '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
              }}
            >
              <strong>Next steps:</strong>
              <ol
                style={{
                  marginTop: '0.5rem',
                  paddingLeft: '1.25rem',
                  lineHeight: '1.75',
                }}
              >
                <li>Copy the enterprise key above</li>
                <li>
                  Open your Twenty self-hosted instance Settings &rarr;
                  Enterprise
                </li>
                <li>Paste the key and click Activate</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}
