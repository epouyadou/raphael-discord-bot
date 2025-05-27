import { Module } from '@nestjs/common';
import { CommonImplModule } from './common/common-impl.module';
import { CommunicationPlatformImplModule } from './communication-platform/communication-platform-impl.module';
import { RepositoryImplModule } from './repositories/repository-impl.module';

@Module({
  imports: [
    RepositoryImplModule,
    CommonImplModule,
    CommunicationPlatformImplModule,
  ],
})
export class InfrastructureModule {}
