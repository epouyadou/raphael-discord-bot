import { Module } from '@nestjs/common';
import { IntlDateTimeFormmatterProvider } from './IntlDateTimeFormatter';
import { MachineTimeProvider } from './MachineTime';

@Module({
  providers: [MachineTimeProvider, IntlDateTimeFormmatterProvider],
  exports: [MachineTimeProvider, IntlDateTimeFormmatterProvider],
})
export class CommonImplModule {}
