// Frozen compatibility exports for shipped upgrade commands.
export {
  agentHistoryMigrationStateSchema as agentHistoryStorageStateSchema,
  type AgentHistoryMigrationState as AgentHistoryStorageState,
} from 'src/database/commands/agent-history/agent-history-migration-state.type';
