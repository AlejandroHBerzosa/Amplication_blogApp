import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
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
    private readonly redisProducer: RedisProducerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super(prisma);
  }

  /**
   * Procesa una solicitud de datos meteorológicos para un post
   * Implementa caché Redis con TTL de 20 minutos para evitar llamadas repetidas a la API
   */
  async processWeatherRequest(postId: string, city: string = "Murcia"): Promise<void> {
    this.logger.log(`🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post ${postId}, ciudad: ${city}`);

    try {
      // 1. Generar clave de caché basada en la ciudad
      const cacheKey = `weather:${city.toLowerCase()}`;
      
      // 2. Verificar si hay datos en caché
      let weatherData = await this.cacheManager.get<WeatherData>(cacheKey);
      
      if (weatherData) {
        this.logger.log(`✅ [WEATHER CACHE] Datos encontrados en caché para ${city}`);
        this.logger.log(`📊 [WEATHER CACHE] Datos: ${weatherData.main}, ${weatherData.temp}°C (desde caché)`);
      } else {
        // 3. Si no hay caché, obtener datos de la API
        this.logger.log(`🌐 [WEATHER API] No hay datos en caché, consultando OpenWeatherMap API para ${city}`);
        const apiWeatherData = await this.openWeatherService.getWeatherDataWithRetry(city);

        if (!apiWeatherData) {
          this.logger.error(`❌ [WEATHER SERVICE] No se pudieron obtener datos meteorológicos para ${city}`);
          
          // Emitir evento de fallo
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

        weatherData = apiWeatherData;

        // 4. Guardar datos en caché (TTL configurado en RedisModule, default 20 min)
        await this.cacheManager.set(cacheKey, weatherData);
        this.logger.log(`💾 [WEATHER CACHE] Datos guardados en caché para ${city} (TTL: 20 minutos)`);
      }

      // 5. Crear el registro de WeatherDatum en la base de datos
      const createdWeatherDatum = await this.prisma.weatherDatum.create({
        data: {
          currentWeather: `${weatherData.main}, ${weatherData.temp}°C`, // Formato string (mantiene compatibilidad)
          weatherDataJson: weatherData as any, // Formato JSON completo (nuevo campo)
          posts: {
            connect: { id: postId }
          }
        }
      });

      this.logger.log(`✅ [WEATHER SERVICE] WeatherDatum creado con ID: ${createdWeatherDatum.id}`);
      this.logger.log(`📊 [WEATHER SERVICE] Datos guardados - String: "${createdWeatherDatum.currentWeather}" | JSON: guardado`);

      // 6. Emitir evento indicando que los datos meteorológicos están disponibles
      await this.redisProducer.emitMessage(
        MessageBrokerTopics.WEATHER_DATA_FETCHED,
        {
          postId,
          weatherDatumId: createdWeatherDatum.id,
          weatherData,
          fromCache: !!await this.cacheManager.get(cacheKey),
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
