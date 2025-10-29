import { Module } from "@nestjs/common";
import { ClientProxyFactory } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { generateRedisClientOptions } from "./generateRedisClientOptions";
import { RedisProducerService } from "./redis.producer.service";
import { RedisController } from "./redis.controller";
import { REDIS_BROKER_CLIENT } from "./constants";
import KeyvRedis from "@keyv/redis";
import { Keyv } from "keyv";

@Module({
  imports: [
    // Configurar CacheModule con Redis como store
    CacheModule.registerAsync({
      isGlobal: true, // Hace el módulo de caché disponible globalmente
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>("REDIS_BROKER_HOST") || "localhost";
        const redisPort = configService.get<number>("REDIS_BROKER_PORT") || 6379;
        const cacheTtl = configService.get<number>("REDIS_CACHE_TTL") || 1200000; // 20 minutos por defecto
        
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(`redis://${redisHost}:${redisPort}`),
              ttl: cacheTtl, // TTL en milisegundos
            }),
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: REDIS_BROKER_CLIENT,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          generateRedisClientOptions(configService)
        );
      },
      inject: [ConfigService],
    },
    RedisProducerService,
  ],
  controllers: [RedisController],
  exports: [RedisProducerService],
})
export class RedisModule {}
