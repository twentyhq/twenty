// Shipped upgrade commands keep this import while live chat uses workspace storage.
export {
  AgentHistoryUpgradeStorageService as AgentHistoryStorageService,
  type AgentHistoryUpgradeStorageContext as AgentHistoryStorageContext,
} from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
