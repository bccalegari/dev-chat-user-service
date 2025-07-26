import { Module } from '@nestjs/common';
import { Neo4jGateway } from './neo4j.gateway';

@Module({
  providers: [Neo4jGateway],
  exports: [Neo4jGateway],
})
export class Neo4jModule {}
