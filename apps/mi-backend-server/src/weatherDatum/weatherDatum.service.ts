import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WeatherDatumServiceBase } from "./base/weatherDatum.service.base";
import { OpenWeatherService, WeatherData } from "./openweather.service";
import { RedisProducerService } from "../redis/redis.producer.service";
import { MessageBrokerTopics } from "../redis/topics";

@Injectable()
export class WeatherDatumService extends WeatherDatumServiceBase {
  private readonly logger = new Logger(WeatherDatumService.name);

  constructor(
    protected readonly prisma: PrismaService,
    private readonly openWeatherService: OpenWeatherService,
    private readonly redisProducer: RedisProducerService
  ) {
    super(prisma);
  }

  /**
   * Procesa una solicitud de datos meteorológicos para un post
   * Hace la llamada a la API de OpenWeatherMap y emite evento con los resultados
   */
  async processWeatherRequest(postId: string, city: string = "Murcia"): Promise<void> {
    this.logger.log(`🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post ${postId}, ciudad: ${city}`);

    try {
      // Obtener datos meteorológicos de OpenWeatherMap
      const weatherData = await this.openWeatherService.getWeatherDataWithRetry(city);

      if (!weatherData) {
        this.logger.error(`❌ [WEATHER SERVICE] No se pudieron obtener datos meteorológicos para ${city}`);
        
        // Emitir evento de fallo (opcional)
        await this.redisProducer.emitMessage(
          MessageBrokerTopics.WEATHER_DATA_FETCHED,
          {
            postId,
            weatherData: null,
            error: "No se pudieron obtener datos meteorológicos",
            timestamp: new Date().toISOString()
          }
        );
        return;
      }

      // Crear el registro de WeatherDatum en la base de datos
      const createdWeatherDatum = await this.prisma.weatherDatum.create({
        data: {
          currentWeather: `${weatherData.main}, ${weatherData.temp}°C`, // Formato: "Clear, 18.5°C"
          posts: {
            connect: { id: postId }
          }
        }
      });

      this.logger.log(`✅ [WEATHER SERVICE] WeatherDatum creado con ID: ${createdWeatherDatum.id}`);

      // Emitir evento indicando que los datos meteorológicos están disponibles
      await this.redisProducer.emitMessage(
        MessageBrokerTopics.WEATHER_DATA_FETCHED,
        {
          postId,
          weatherDatumId: createdWeatherDatum.id,
          weatherData,
          timestamp: new Date().toISOString()
        }
      );

      this.logger.log(`📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado para post ${postId}`);

    } catch (error) {
      this.logger.error(`❌ [WEATHER SERVICE] Error procesando solicitud: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emitir evento de error
      await this.redisProducer.emitMessage(
        MessageBrokerTopics.WEATHER_DATA_FETCHED,
        {
          postId,
          weatherData: null,
          error: error instanceof Error ? error.message : "Error desconocido",
          timestamp: new Date().toISOString()
        }
      );
    }
  }
}
