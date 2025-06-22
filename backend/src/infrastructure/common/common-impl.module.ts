import { Module } from '@nestjs/common';
import { DurationParserProvider } from './DurationParser';
import { IntlDateTimeFormmatterProvider } from './IntlDateTimeFormatter';
import { MachineTimeProvider } from './MachineTime';

@Module({
  providers: [
    DurationParserProvider,
    MachineTimeProvider,
    IntlDateTimeFormmatterProvider,
  ],
  exports: [
    DurationParserProvider,
    MachineTimeProvider,
    IntlDateTimeFormmatterProvider,
  ],
})
export class CommonImplModule {}
