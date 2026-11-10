export enum UserTypeEnum {
  COLABORADOR = 'COLABORADOR',
  EXTERNO = 'EXTERNO',
  /** Usuário de sistema (bootstrap `admin`): não pode ser criado pela API nem desativado. */
  SISTEMA = 'SISTEMA'
}