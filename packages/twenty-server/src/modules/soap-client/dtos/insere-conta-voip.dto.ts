import { ContaVoipEstrutura } from 'src/modules/soap-client/interfaces/conta-voip.interface';

export class InsereContaVoipDto implements ContaVoipEstrutura {
  // ContaVoipEstrutura properties
  numero?: string;
  dominio?: string;
  senha?: string;
  cliente_id: number;
  postpaid: boolean;
  aviso_saldo_habilita: number;
  aviso_saldo_valor: number;
  assinatura_valor: number;
  assinatura_dia: number;
  saldo: number;
  chamadas_ilimitadas_fixo?: string;
  chamadas_ilimitadas_movel?: string;
  chamadas_ilimitadas_internacional?: string;
  permitir_registros_do_ip?: string;
  permitir_registros_do_user_agent?: string;
  erro_motivo?: string;

  // Additional required parameters
  tabela_roteamento_id: number;
  tabela_preco_id: number;
  ddd_local: number;
}
