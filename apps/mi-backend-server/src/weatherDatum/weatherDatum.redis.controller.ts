import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { WeatherDatumService } from "./weatherDatum.service";

@Controller("weather-redis-controller")
export class WeatherDatumRedisController {
  private readonly logger = new Logger(WeatherDatumRedisController.name);

  constructor(private readonly weatherDatumService: WeatherDatumService) {}

  @EventPattern("post.create.weather_request")
  async handleWeatherRequest(@Payload() data: any) {
    this.logger.log("🌤️ [WEATHER REDIS HANDLER] Solicitud de datos meteorológicos recibida:");
    this.logger.log(`📋 [WEATHER REDIS HANDLER] Post ID: ${data.postId}, Ciudad: ${data.city || "Murcia"}`);

    try {
      // Procesar la solicitud de datos meteorológicos
      await this.weatherDatumService.processWeatherRequest(
        data.postId,
        data.city || "Murcia"
      );

      this.logger.log(`✅ [WEATHER REDIS HANDLER] Solicitud procesada exitosamente para post ${data.postId}`);
    } catch (error) {
      this.logger.error(
        `❌ [WEATHER REDIS HANDLER] Error procesando solicitud: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
