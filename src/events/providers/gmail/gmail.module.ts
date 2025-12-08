import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailClient } from './gmail.client';

@Module({
  providers: [GmailService, GmailClient],
  exports: [GmailService]
})
export class GmailModule {}
