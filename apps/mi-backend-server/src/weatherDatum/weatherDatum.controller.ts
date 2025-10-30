import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { WeatherDatumService } from "./weatherDatum.service";
import { WeatherDatumControllerBase } from "./base/weatherDatum.controller.base";

@swagger.ApiTags("weatherData")
@common.Controller("weatherData")
export class WeatherDatumController extends WeatherDatumControllerBase {
  constructor(
    protected readonly service: WeatherDatumService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Endpoint temporal para verificar datos JSON
  @common.Get("debug/latest")
  @swagger.ApiOperation({ summary: "Obtener los últimos 5 registros con datos JSON completos" })
  async getLatestWithJson() {
    const data = await this.service.weatherData({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        currentWeather: true,
        weatherDataJson: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      message: "Últimos 5 registros de WeatherDatum",
      count: data.length,
      data: data
    };
  }
}
