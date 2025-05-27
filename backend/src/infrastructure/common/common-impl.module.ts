import { Module } from '@nestjs/common';
import { MachineTimeProvider } from './MachineTime';

@Module({
  providers: [MachineTimeProvider],
  exports: [MachineTimeProvider],
})
export class CommonImplModule {}
