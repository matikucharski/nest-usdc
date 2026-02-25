import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
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
      ttl: 60 * 1000 // milliseconds
    }),
    BlockchainModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
