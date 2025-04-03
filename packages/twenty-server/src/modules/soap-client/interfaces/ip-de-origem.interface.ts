export interface IpDeOrigemEstrutura {
  cliente_id: number;
  ip: string;
  pospago: boolean;
  compartilhado: boolean;
  tech_prefix?: string;
  monitora_ping: boolean;
  tabela_roteamento_id: number;
  tabela_venda_id: number;
  notificacao_saldo_habilitado: boolean;
  notificacao_saldo_valor: number;
  local: number;
  erro_motivo?: string;
}
