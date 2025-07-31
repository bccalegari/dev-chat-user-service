import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';
import * as neo4j from 'neo4j-driver';
import { logError } from '@shared/logging/log-error';

@Injectable()
export class Neo4jGateway implements OnModuleDestroy {
  private readonly logger = new Logger(Neo4jGateway.name);
  private readonly driver: Driver;

  constructor(private readonly configService: ConfigService) {
    this.driver = neo4j.driver(
      this.configService.get<string>('NEO4J_URL')!,
      neo4j.auth.basic(
        this.configService.get<string>('NEO4J_USERNAME')!,
        this.configService.get<string>('NEO4J_PASSWORD')!,
      ),
    );
  }

  async write(cypher: string, params: any = {}) {
    const session = this.driver.session({
      defaultAccessMode: neo4j.session.WRITE,
    });
    try {
      await session.run(cypher, params);
    } catch (error) {
      logError('Error executing write operation', error, this.logger);
      throw error;
    } finally {
      await session.close();
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
  }
}
