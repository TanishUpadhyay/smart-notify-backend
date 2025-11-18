import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { Token } from './entity/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokensService],
  exports: [TokensService]
})
export class TokensModule {}
