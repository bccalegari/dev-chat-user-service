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
      return this.find(query, { id });
    } catch (error) {
      this.logger.error(
        `Failed to find profile by id in Neo4j`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    try {
      const query = `
        MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(p:Profile)
        WHERE u.deleted_at IS NULL AND p.deleted_at IS NULL
        RETURN p
      `;
      return this.find(query, { userId });
    } catch (error) {
      this.logger.error(
        `Failed to find profile by userId in Neo4j`,
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
          bio: $bio,
          avatar_url: $avatarUrl,
          user_id: $userId,
          created_at: $createdAt
        })
        CREATE (u)-[:HAS_PROFILE]->(p)
      `;

      const params = {
        id: profile.id,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
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
        SET p.bio = $bio,
            p.avatar_url = $avatarUrl,
            p.updated_at = $updatedAt
      `;

      const params = {
        id: profile.id,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
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
