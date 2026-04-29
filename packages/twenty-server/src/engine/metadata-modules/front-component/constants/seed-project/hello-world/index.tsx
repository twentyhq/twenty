import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext, useUserId } from 'twenty-sdk/front-component';
import { useState } from 'react';

const HelloWorld = () => {
  const [renderCount, setRenderCount] = useState(0);

  const userId = useUserId();
  const fullContext = useFrontComponentExecutionContext((context) => context);

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
        Hello World
      </h2>

      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          User ID
        </p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0c4a6e',
            wordBreak: 'break-all',
          }}
        >
          {userId ?? 'null'}
        </p>
      </div>

      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Execution Context
        </p>
        <pre
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0c4a6e',
            background: '#e0f2fe',
            padding: 12,
            borderRadius: 8,
            overflow: 'auto',
            wordBreak: 'break-all',
          }}
        >
          {JSON.stringify(fullContext, null, 2) ?? 'undefined'}
        </pre>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setRenderCount((c) => c + 1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Re-render
        </button>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Render count: {renderCount}
        </span>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'seed-front-component-hello-world',
  name: 'Hello World',
  description:
    'A sample visual front component that displays execution context',
  component: HelloWorld,
});
