import { ClienteEstrutura } from 'src/modules/soap-client/interfaces/cliente.interface';
import { ContaVoipEstrutura } from 'src/modules/soap-client/interfaces/conta-voip.interface';
import { IpDeOrigemEstrutura } from 'src/modules/soap-client/interfaces/ip-de-origem.interface';

export class createCompleteClientDto {
  cliente: ClienteEstrutura;
  contaVoip: Omit<ContaVoipEstrutura, 'cliente_id'>;
  ipDeOrigem: Omit<IpDeOrigemEstrutura, 'cliente_id'>;
  tabela_roteamento_id: number;
  tabela_preco_id: number;
  ddd_local: number;
}
