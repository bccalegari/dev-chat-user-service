import { Injectable, Logger } from '@nestjs/common';
import { Neo4jGateway } from '@shared/neo4j/neo4j.gateway';
import { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository.interface';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileMapper } from '@modules/profile/application/mappers/profile.mapper';

@Injectable()
export class ProfileNeo4jRepository implements ProfileRepository {
  private readonly logger = new Logger(ProfileNeo4jRepository.name);

  constructor(private readonly gateway: Neo4jGateway) {}

  async findById(id: string): Promise<Profile | null> {
    try {
      const query = `
        MATCH (p:Profile {id: $id})
        WHERE p.deleted_at IS NULL
        RETURN p
      `;
      const params = { id };
      return this.find(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to find profile by id in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    soft: boolean = true,
  ): Promise<Profile | null> {
    try {
      const deletedAtCondition = soft
        ? 'WHERE u.deleted_at IS NULL AND p.deleted_at IS NULL'
        : '';
      const query = `
        MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(p:Profile)
        ${deletedAtCondition}
        RETURN p
      `;
      const params = { userId };
      return this.find(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to find profile by userId in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async existsByUsername(username: string): Promise<boolean> {
    try {
      const query = `
        MATCH (p:Profile {username: $username})
        WHERE p.deleted_at IS NULL
        RETURN COUNT(p) AS count
      `;
      const params = { username };
      const result = await this.gateway.read(query, params);
      const count = result.records[0].get('count').toInt();
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check existence of profile by username in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async create(profile: Profile): Promise<void> {
    try {
      const query = `
        MATCH (u:User {id: $userId})
        WHERE u.deleted_at IS NULL
        CREATE (p:Profile {
          id: $id,
          username: $username,
          birth_date: $birthDate,
          bio: $bio,
          user_id: $userId,
          created_at: $createdAt
        })
        CREATE (u)-[:HAS_PROFILE]->(p)
      `;

      const params = {
        id: profile.id,
        username: profile.username,
        birthDate: profile.birthDateString,
        bio: profile.bio,
        userId: profile.userId,
        createdAt: profile.createdAt.toISOString(),
      };

      await this.gateway.write(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to create profile in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async update(profile: Profile): Promise<void> {
    try {
      const query = `
        MATCH (p: Profile {id: $id})
        WHERE p.deleted_at IS NULL
        SET p.username = $username,
            p.birth_date = $birthDate,
            p.bio = $bio,
            p.updated_at = $updatedAt
      `;

      const params = {
        id: profile.id,
        username: profile.username,
        birthDate: profile.birthDateString,
        bio: profile.bio,
        updatedAt: profile.updatedAt!.toISOString(),
      };

      await this.gateway.write(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to update profile in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async delete(profile: Profile): Promise<void> {
    try {
      const query = `
        MATCH (p:Profile {id: $id})
        WHERE p.deleted_at IS NULL
        SET p.deleted_at = $deletedAt
      `;

      const params = {
        id: profile.id,
        deletedAt: profile.deletedAt!.toISOString(),
      };

      await this.gateway.write(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to delete profile in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async find(
    query: string,
    params: Record<string, any>,
  ): Promise<Profile | null> {
    const result = await this.gateway.read(query, params);
    if (result.records.length === 0) {
      return null;
    }
    const profileNode = result.records[0].get('p').properties;
    return ProfileMapper.fromNeo4j(profileNode);
  }
}
