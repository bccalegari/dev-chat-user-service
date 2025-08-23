import { Module } from '@nestjs/common';
import { Neo4jModule } from '@shared/neo4j/neo4j.module';
import { ProfileResolver } from '@modules/profile/adapters/inbound/resolvers/profile.resolver';
import { PROFILE_REPOSITORY } from '@modules/profile/domain/repositories/profile.repository.interface';
import { ProfileNeo4jRepository } from '@modules/profile/adapters/outbound/profile-neo4j.repository';
import { CreateProfileUsecase } from '@modules/profile/application/usecases/create-profile.usecase';
import { GetProfileByUserIdUsecase } from '@modules/profile/application/usecases/get-profile-by-user-id.usecase';
import { UpdateProfileUsecase } from '@modules/profile/application/usecases/update-profile.usecase';
import { DeleteProfileUsecase } from '@modules/profile/application/usecases/delete-profile.usecase';
import { USER_REPOSITORY } from '@modules/user/domain/repositories/user.repository.interface';
import { UserNeo4jRepository } from '@modules/user/adapters/outbound/repositories/user-neo4j.repository';
import { ProfileDeletedListener } from '@modules/profile/application/listeners/profile-deleted.listener';

@Module({
  imports: [Neo4jModule],
  providers: [
    ProfileResolver,
    CreateProfileUsecase,
    GetProfileByUserIdUsecase,
    UpdateProfileUsecase,
    DeleteProfileUsecase,
    ProfileDeletedListener,
    {
      provide: USER_REPOSITORY,
      useClass: UserNeo4jRepository,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileNeo4jRepository,
    },
  ],
})
export class ProfileModule {}
