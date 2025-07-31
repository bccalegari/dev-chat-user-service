export interface Value {
  id: string;
  email: string | null;
  email_constraint: string | null;
  email_verified: boolean;
  enabled: boolean;
  federation_link: string | null;
  first_name: string | null;
  last_name: string | null;
  realm_id: string | null;
  username: string | null;
  created_timestamp: number | null;
  service_account_client_link: string | null;
  not_before: number;
}

export interface Source {
  version: string;
  connector: string;
  name: string;
  ts_ms: number;
  snapshot: 'true' | 'last' | 'false' | 'incremental' | null;
  db: string;
  sequence: string | null;
  ts_us: number;
  ts_ns: number;
  schema: string;
  table: string;
  txId: number | null;
  lsn: number | null;
  xmin: number | null;
}

export interface Block {
  id: string;
  total_order: number;
  data_collection_order: number;
}

export interface Envelope {
  before: Value | null;
  after: Value | null;
  source: Source;
  op: 'c' | 'u' | 'd';
  ts_ms: number | null;
  ts_us: number | null;
  ts_ns: number | null;
  transaction: Block | null;
}

export type UserChangeEventValue = Value;
export type UserChangeEventSource = Source;
export type UserChangeEventBlock = Block;
export type UserChangeEventEnvelope = Envelope;
