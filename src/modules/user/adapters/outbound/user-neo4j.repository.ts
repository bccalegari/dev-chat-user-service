import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { Neo4jGateway } from '@shared/neo4j/neo4j.gateway';
import { User } from '@modules/user/domain/entities/user';
import { UserMapper } from '@modules/user/application/mappers/user.mapper';

@Injectable()
export class UserNeo4jRepository implements UserRepository {
  private readonly logger = new Logger(UserNeo4jRepository.name);

  constructor(private readonly gateway: Neo4jGateway) {}

  async findById(id: string): Promise<User | null> {
    try {
      const query = `
        MATCH (u:User {id: $id})
        RETURN u
      `;
      const params = { id };
      return this.find(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to find user by id in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    try {
      const query = `
        MATCH (u:User {keycloak_id: $keycloakId})
        RETURN u
      `;
      const params = { keycloakId };
      return this.find(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to find user by keycloak id in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async create(user: User): Promise<void> {
    try {
      const query = `
        CREATE (u:User {
          id: $id,
          keycloak_id: $keycloakId,
          username: $username,
          email: $email,
          name: $name,
          last_name: $lastName,
          created_at: $createdAt
        })
      `;

      const params = {
        id: user.id,
        keycloakId: user.keycloakId,
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        createdAt: user.createdAt.toISOString(),
      };

      await this.gateway.write(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to create user in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async update(user: User): Promise<void> {
    try {
      const query = `
        MATCH (u:User {id: $id})
        SET u.username = $username,
            u.email = $email,
            u.name = $name,
            u.last_name = $lastName,
            u.updated_at = $updatedAt
      `;

      const params = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        updatedAt: user.updatedAt!.toISOString(),
      };

      await this.gateway.write(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to update user in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async find(
    query: string,
    params: Record<string, any>,
  ): Promise<User | null> {
    const result = await this.gateway.read(query, params);
    if (result.records.length === 0) {
      return null;
    }
    const userNode = result.records[0].get('u').properties;
    return UserMapper.fromNeo4j(userNode);
  }
}
