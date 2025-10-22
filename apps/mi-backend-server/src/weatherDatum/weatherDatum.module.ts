import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WeatherDatumModuleBase } from "./base/weatherDatum.module.base";
import { WeatherDatumService } from "./weatherDatum.service";
import { WeatherDatumController } from "./weatherDatum.controller";
import { WeatherDatumResolver } from "./weatherDatum.resolver";

@Module({
  imports: [WeatherDatumModuleBase, forwardRef(() => AuthModule)],
  controllers: [WeatherDatumController],
  providers: [WeatherDatumService, WeatherDatumResolver],
  exports: [WeatherDatumService],
})
export class WeatherDatumModule {}
