import { Injectable, Logger } from '@nestjs/common';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { ConfigService } from '@nestjs/config';
import { logError } from '@shared/logger/log-error';
import * as avro from 'avsc';

@Injectable()
export class SchemaRegistryGateway {
  private readonly logger = new Logger(SchemaRegistryGateway.name);
  private readonly registry: SchemaRegistry;

  constructor(configService: ConfigService) {
    const url = configService.get<string>('SCHEMA_REGISTRY_URL')!;
    this.registry = new SchemaRegistry(
      { host: url },
      {
        forSchemaOptions: {
          registry: { long: this.createSafeLongType() },
        },
      },
    );
  }

  async encode<T>(subject: string, payload: T): Promise<Buffer> {
    try {
      const schemaId = await this.registry.getLatestSchemaId(subject);
      return this.registry.encode(schemaId, payload);
    } catch (error) {
      logError('Failed to encode message', error, this.logger);
      throw error;
    }
  }

  async decode<T>(buffer: Buffer | null): Promise<T> {
    try {
      return (await this.registry.decode(<Buffer>buffer)) as Promise<T>;
    } catch (error) {
      logError('Failed to decode message', error, this.logger);
      throw error;
    }
  }

  private createSafeLongType(): avro.types.LongType {
    return avro.types.LongType.__with({
      fromBuffer: (buf: Buffer) => buf.readBigInt64BE(),
      toBuffer: (n: number | bigint) => {
        const buf = Buffer.alloc(8);
        if (typeof n === 'number') {
          n = BigInt(n);
        }
        buf.writeBigInt64BE(n);
        return buf;
      },
      fromJSON: (n: unknown) => {
        if (
          typeof n === 'string' ||
          typeof n === 'number' ||
          typeof n === 'bigint' ||
          typeof n === 'boolean'
        ) {
          return BigInt(n);
        }
        throw new TypeError(`Invalid type for BigInt conversion: ${typeof n}`);
      },
      toJSON: (n: bigint) => n.toString(),
      isValid: (n: unknown) => typeof n === 'bigint' || typeof n === 'number',
      compare: (n1: bigint | number, n2: bigint | number) => {
        const bn1 = typeof n1 === 'bigint' ? n1 : BigInt(n1);
        const bn2 = typeof n2 === 'bigint' ? n2 : BigInt(n2);
        if (bn1 === bn2) return 0;
        return bn1 < bn2 ? -1 : 1;
      },
    });
  }
}
