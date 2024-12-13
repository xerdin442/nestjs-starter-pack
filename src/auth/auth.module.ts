import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../common/strategy/jwt-strategy';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from '../common/processors/mail.processor';
import { SessionService } from '../common/session';

@Module({
  imports: [
    JwtModule.register({}),
    BullModule.registerQueue({
      name: 'mail-queue'
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailProcessor,
    SessionService
  ]
})
export class AuthModule {}
