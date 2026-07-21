import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useEffect, useState } from 'react';

type CompanySummary = Pick<CoreSchema.Company, 'id' | 'name'>;

const ListCompanies = () => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = new CoreApiClient();
        const result = await client.query({
          companies: {
            edges: {
              node: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!cancelled) {
          setCompanies(result.companies.edges.map((edge) => edge.node));
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Failed to load companies',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCompanies();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: 'system-ui, sans-serif',
        background: '#f0f9ff',
        borderRadius: 12,
        border: '2px solid #38bdf8',
        maxWidth: 400,
      }}
    >
      <h2
        style={{
          color: '#0369a1',
          fontWeight: 700,
          fontSize: 18,
          margin: 0,
        }}
      >
        List Companies
      </h2>

      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Queried via CoreApiClient
      </p>

      {loading && <p style={{ color: '#0c4a6e' }}>Loading companies…</p>}

      {error && (
        <p style={{ color: '#b91c1c', wordBreak: 'break-all' }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && (
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            color: '#0c4a6e',
            fontWeight: 600,
          }}
        >
          {companies.length === 0 && <li>No companies found</li>}
          {companies.map((company) => (
            <li key={company.id}>{company.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'seed-front-component-list-companies',
  name: 'List Companies',
  description:
    'A sample visual front component that queries companies through the SDK client',
  component: ListCompanies,
});
