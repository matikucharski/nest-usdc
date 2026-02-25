import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000 // ms
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        // 3 requests per second
        {
          ttl: 1000, // ms
          limit: 3
        }
      ]
    }),
    BlockchainModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    AppService
  ]
})
export class AppModule {}
