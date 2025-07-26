import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { Neo4jGateway } from '@shared/neo4j/neo4j.gateway';
import { User } from '@modules/user/domain/entities/user';

@Injectable()
export class UserNeo4jRepository implements UserRepository {
  private readonly logger = new Logger(UserNeo4jRepository.name);

  constructor(private readonly gateway: Neo4jGateway) {}

  async createUser(user: User): Promise<void> {
    try {
      const query = `
        CREATE (u:User {
          id: $id,
          keycloakId: $keycloakId,
          username: $username,
          email: $email,
          name: $name,
          lastName: $lastName,
          createdAt: $createdAt
        })
      `;

      const params = {
        id: user.id,
        keycloakId: user.keycloakId,
        username: user.username,
        email: user.email.getValue(),
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
}
