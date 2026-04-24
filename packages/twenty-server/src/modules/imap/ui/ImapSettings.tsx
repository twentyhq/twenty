import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import styled from '@emotion/styled';

const TEST_IMAP_CONNECTION = gql`
  mutation TestImapConnection($input: ImapCredentialsInput!) {
    testImapConnection(input: $input) {
      success
      message
    }
  }
`;

const CONNECT_IMAP_ACCOUNT = gql`
  mutation ConnectImapAccount($input: ImapCredentialsInput!) {
    connectImapAccount(input: $input)
  }
`;

const GET_IMAP_FOLDERS = gql`
  query GetImapFolders($accountId: String!) {
    getImapFolders(accountId: $accountId) {
      path
      name
      delimiter
      flags
      specialUse
    }
  }
`;

const Container = styled.div`
  padding: 24px;
  max-width: 600px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 12px;
  
  background-color: ${({ variant, theme }) =>
    variant === 'primary' ? theme.color.blue : theme.background.transparent.light};
  color: ${({ variant, theme }) =>
    variant === 'primary' ? '#fff' : theme.font.color.primary};
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: ${({ type, theme }) =>
    type === 'success' ? theme.color.green : theme.color.red};
  color: #fff;
`;

const PresetConfigs = {
  gmail: {
    host: 'imap.gmail.com',
    port: 993,
    useTls: true,
  },
  outlook: {
    host: 'outlook.office365.com',
    port: 993,
    useTls: true,
  },
  yahoo: {
    host: 'imap.mail.yahoo.com',
    port: 993,
    useTls: true,
  },
  custom: {
    host: '',
    port: 993,
    useTls: true,
  },
};

export const ImapSettings: React.FC = () => {
  const [provider, setProvider] = useState<keyof typeof PresetConfigs>('gmail');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState(PresetConfigs.gmail.host);
  const [imapPort, setImapPort] = useState(PresetConfigs.gmail.port);
  const [useTls, setUseTls] = useState(PresetConfigs.gmail.useTls);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  const [testConnection, { loading: testing }] = useMutation(TEST_IMAP_CONNECTION);
  const [connectAccount, { loading: connecting }] = useMutation(CONNECT_IMAP_ACCOUNT);

  const { data: foldersData } = useQuery(GET_IMAP_FOLDERS, {
    variables: { accountId: connectedAccountId },
    skip: !connectedAccountId,
  });

  const handleProviderChange = (value: keyof typeof PresetConfigs) => {
    setProvider(value);
    const config = PresetConfigs[value];
    setImapHost(config.host);
    setImapPort(config.port);
    setUseTls(config.useTls);
  };

  const handleTestConnection = async () => {
    try {
      const { data } = await testConnection({
        variables: {
          input: {
            email,
            password,
            imapHost,
            imapPort,
            useTls,
          },
        },
      });

      if (data.testImapConnection.success) {
        setMessage({ type: 'success', text: 'Connection successful!' });
      } else {
        setMessage({ type: 'error', text: data.testImapConnection.message || 'Connection failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleConnect = async () => {
    try {
      const { data } = await connectAccount({
        variables: {
          input: {
            email,
            password,
            imapHost,
            imapPort,
            useTls,
          },
        },
      });

      setConnectedAccountId(data.connectImapAccount);
      setMessage({ type: 'success', text: 'Account connected successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <Container>
      <h2>IMAP Email Integration</h2>

      {message && <Message type={message.type}>{message.text}</Message>}

      <FormGroup>
        <Label>Email Provider</Label>
        <Select value={provider} onChange={(e) => handleProviderChange(e.target.value as any)}>
          <option value="gmail">Gmail</option>
          <option value="outlook">Outlook / Office 365</option>
          <option value="yahoo">Yahoo Mail</option>
          <option value="custom">Custom IMAP Server</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Email Address</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </FormGroup>

      <FormGroup>
        <Label>Password / App Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password or app password"
        />
      </FormGroup>

      {provider === 'custom' && (
        <>
          <FormGroup>
            <Label>IMAP Server Host</Label>
            <Input
              type="text"
              value={imapHost}
              onChange={(e) => setImapHost(e.target.value)}
              placeholder="imap.example.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>IMAP Port</Label>
            <Input
              type="number"
              value={imapPort}
              onChange={(e) => setImapPort(parseInt(e.target.value))}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                checked={useTls}
                onChange={(e) => setUseTls(e.target.checked)}
              />
              {' '}Use TLS/SSL
            </Label>
          </FormGroup>
        </>
      )}

      <div>
        <Button onClick={handleTestConnection} disabled={testing || connecting}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button variant="primary" onClick={handleConnect} disabled={testing || connecting}>
          {connecting ? 'Connecting...' : 'Connect Account'}
        </Button>
      </div>

      {foldersData && (
        <div style={{ marginTop: 24 }}>
          <h3>Synced Folders</h3>
          <ul>
            {foldersData.getImapFolders.map((folder: any) => (
              <li key={folder.path}>{folder.name}</li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
};
