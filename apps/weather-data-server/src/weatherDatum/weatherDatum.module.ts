import { Module } from "@nestjs/common";
import { WeatherDatumModuleBase } from "./base/weatherDatum.module.base";
import { WeatherDatumService } from "./weatherDatum.service";
import { WeatherDatumController } from "./weatherDatum.controller";
import { WeatherDatumResolver } from "./weatherDatum.resolver";

@Module({
  imports: [WeatherDatumModuleBase],
  controllers: [WeatherDatumController],
  providers: [WeatherDatumService, WeatherDatumResolver],
  exports: [WeatherDatumService],
})
export class WeatherDatumModule {}
