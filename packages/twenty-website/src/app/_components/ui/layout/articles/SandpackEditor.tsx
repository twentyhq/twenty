'use client';
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import styled from '@emotion/styled';

const Sandpack = styled.div`
  max-width: 600px;
`;

const SandpackContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

interface SandpackEditorProps {
  content: string;
}

export default function SandpackEditor({ content }: SandpackEditorProps) {
  return (
    <Sandpack>
      <SandpackProvider
        template="react"
        files={{
          '/App.js': `${content}`,
        }}
      >
        <SandpackLayout>
          <SandpackContainer>
            <SandpackCodeEditor showTabs showInlineErrors wrapContent />
          </SandpackContainer>
        </SandpackLayout>
      </SandpackProvider>
    </Sandpack>
  );
}
