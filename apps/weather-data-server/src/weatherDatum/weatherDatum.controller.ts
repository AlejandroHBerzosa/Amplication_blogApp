import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { WeatherDatumService } from "./weatherDatum.service";
import { WeatherDatumControllerBase } from "./base/weatherDatum.controller.base";

@swagger.ApiTags("weatherData")
@common.Controller("weatherData")
export class WeatherDatumController extends WeatherDatumControllerBase {
  constructor(protected readonly service: WeatherDatumService) {
    super(service);
  }
}
