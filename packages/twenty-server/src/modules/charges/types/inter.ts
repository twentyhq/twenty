// src/engine/core-modules/inter/inter.types.ts

export interface Payer {
  cpfCnpj: string;
  tipoPessoa: string;
  nome: string;
  cidade: string;
  telefone: string;
  uf: string;
  cep: string;
  email: string;
  ddd: string;
  numero: string;
  complemento: string;
  endereco: string;
  bairro: string;
}

export interface ChargeMessage {
  linha1?: string;
}

export interface ChargeData {
  id: string;
  authorId: string;
  seuNumero: string;
  valorNominal: number;
  dataVencimento: string;
  numDiasAgenda: number;
  pagador: Payer;
  mensagem?: ChargeMessage;
}

export interface ChargeResponse {
  codigoSolicitacao: string;
}

export interface FlattenedPerson {
  phonesPrimaryPhoneNumber?: string;
  phonesPrimaryPhoneCallingCode?: string;
  emailsPrimaryEmail?: string;
  nameFirstName?: string;
  nameLastName?: string;
  city?: string;
  createdByWorkspaceMemberId?: string;
}

export interface FlattenedCompany {
  addressAddressStreet1?: string;
  addressAddressStreet2?: string;
  addressAddressState?: string;
  addressAddressPostcode?: string;
  addressAddressCountry?: string;
  addressAddressCity?: string;
  createdByWorkspaceMemberId?: string;
  name?: string;
}
