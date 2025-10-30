import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

export interface WeatherData {
  main: string;           // weather.main (ej: "Clear", "Clouds")
  temp: number;           // main.temp (temperatura en Celsius)
  description?: string;   // weather.description (ej: "cielo claro")
  humidity?: number;      // main.humidity (humedad en %)
  windSpeed?: number;     // wind.speed (velocidad del viento en m/s)
  feelsLike?: number;     // main.feels_like (sensación térmica)
  pressure?: number;      // main.pressure (presión atmosférica en hPa)
  city?: string;          // name (nombre de la ciudad)
  country?: string;       // sys.country (código del país)
}

@Injectable()
export class OpenWeatherService {
  private readonly logger = new Logger(OpenWeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5/weather";

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("OPENWEATHER_API_KEY") || "";
    
    if (!this.apiKey) {
      this.logger.warn("⚠️ OPENWEATHER_API_KEY no está configurada. El servicio meteorológico no funcionará correctamente.");
    }
  }

  /**
   * Obtiene datos meteorológicos de OpenWeatherMap para una ciudad específica
   * @param city Nombre de la ciudad (por defecto: Murcia)
   * @returns Datos meteorológicos formateados
   */
  async getWeatherData(city: string = "Murcia"): Promise<WeatherData | null> {
    if (!this.apiKey) {
      this.logger.error("❌ [OPENWEATHER] API Key no configurada");
      return null;
    }

    try {
      this.logger.log(`🌤️ [OPENWEATHER] Consultando clima para: ${city}`);
      
      const response = await axios.get(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: "metric", // Celsius
          lang: "es" // Descripciones en español
        },
        timeout: 5000 // 5 segundos timeout
      });

      const data = response.data;

      const weatherData: WeatherData = {
        main: data.weather[0].main,                          // "Clear", "Clouds", "Rain", etc.
        temp: Math.round(data.main.temp * 10) / 10,         // Temperatura redondeada a 1 decimal
        description: data.weather[0].description,            // Descripción detallada
        humidity: data.main.humidity,                        // Humedad %
        windSpeed: Math.round(data.wind.speed * 10) / 10,   // Velocidad del viento
        feelsLike: Math.round(data.main.feels_like * 10) / 10, // Sensación térmica
        pressure: data.main.pressure,                        // Presión atmosférica
        city: data.name,                                     // Nombre de la ciudad
        country: data.sys.country,                           // Código del país
      };

      this.logger.log(`✅ [OPENWEATHER] Datos obtenidos: ${weatherData.main}, ${weatherData.temp}°C, ${weatherData.description}`);
      
      return weatherData;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.logger.error("❌ [OPENWEATHER] API Key inválida");
        } else if (error.response?.status === 404) {
          this.logger.error(`❌ [OPENWEATHER] Ciudad no encontrada: ${city}`);
        } else {
          this.logger.error(`❌ [OPENWEATHER] Error en la API: ${error.message}`);
        }
      } else {
        this.logger.error(`❌ [OPENWEATHER] Error desconocido: ${error}`);
      }
      return null;
    }
  }

  /**
   * Obtiene datos meteorológicos con reintentos
   */
  async getWeatherDataWithRetry(city: string = "Murcia", retries: number = 3): Promise<WeatherData | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const data = await this.getWeatherData(city);
      if (data) {
        return data;
      }
      
      if (attempt < retries) {
        this.logger.warn(`⚠️ [OPENWEATHER] Intento ${attempt} falló, reintentando...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff exponencial
      }
    }
    
    this.logger.error(`❌ [OPENWEATHER] Todos los intentos fallaron después de ${retries} reintentos`);
    return null;
  }
}
