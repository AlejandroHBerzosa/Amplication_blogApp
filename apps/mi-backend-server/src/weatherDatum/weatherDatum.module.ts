import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WeatherDatumModuleBase } from "./base/weatherDatum.module.base";
import { WeatherDatumService } from "./weatherDatum.service";
import { WeatherDatumController } from "./weatherDatum.controller";
import { WeatherDatumResolver } from "./weatherDatum.resolver";
import { OpenWeatherService } from "./openweather.service";
import { WeatherDatumRedisController } from "./weatherDatum.redis.controller";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    WeatherDatumModuleBase, 
    forwardRef(() => AuthModule),
    RedisModule
  ],
  controllers: [WeatherDatumController, WeatherDatumRedisController],
  providers: [WeatherDatumService, WeatherDatumResolver, OpenWeatherService],
  exports: [WeatherDatumService],
})
export class WeatherDatumModule {}
