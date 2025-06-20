// src/engine/core-modules/inter/inter.types.ts

export interface Payer {
  nome: string;
  cpfCnpj: string;
  tipoPessoa: string;
  cep: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone?: string;
  email?: string;
  ddd?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
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
