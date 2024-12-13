import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import  { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    AuthModule,
    UserModule,
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BullModule.forRoot({
      redis: {
        host: new ConfigService().get<string>('REDIS_HOST'),
        port: new ConfigService().get<number>('REDIS_PORT'),
        db: 0,
        password: new ConfigService().get<string>('REDIS_PASSWORD')
      }
    }),
    ThrottlerModule.forRoot([{
      name: 'Seconds',
      ttl: 1000,
      limit: 3  // Not more than 3 requests in any one second
    }, {
      name: 'Minutes',
      ttl: 60000,
      limit: 75 // Not more than 75 requests in any one minute
    }]),
  ],

  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }]
})
export class AppModule {}
