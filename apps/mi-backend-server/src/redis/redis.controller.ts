import { EventPattern, Payload } from "@nestjs/microservices";
import { Controller, Logger } from "@nestjs/common";
import { RedisMessage } from "./redisMessage";

@Controller("redis-controller")
export class RedisController {
  private readonly logger = new Logger(RedisController.name);
  
  @EventPattern('post.created')
  async handlePostCreated(@Payload() data: any) {
    console.log("🎉 [REDIS HANDLER] Nuevo post creado recibido:");
    console.log("📋 [REDIS HANDLER] Datos del evento:", {
      postId: data.id,
      title: data.title,
      author: data.userId,
      timestamp: data.timestamp
    });
    
    // Aquí puedes añadir lógica como:
    // - Enviar notificaciones:  await this.sendNotificationToFollowers(data.userId);
    // - Actualizar cache
    // - Generar analytics
    // - Indexar para búsqueda
  }

  @EventPattern('post.viewed')
  async handlePostViewed(@Payload() data: any) {
    console.log("👀 [REDIS HANDLER] Post visualizado:");
    console.log("📊 [REDIS HANDLER] Datos de visualización:", {
      postId: data.id,
      title: data.title,
      viewedAt: data.viewedAt
    });
    
    // Aquí puedes añadir lógica como:
    // - Incrementar contador de vistas
    // - Analytics de popularidad
    // - Recomendaciones
  }

  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any) {
    console.log("👤 [REDIS HANDLER] Nuevo usuario registrado:");
    console.log("📝 [REDIS HANDLER] Datos del usuario:", data);
    
    // Lógica para nuevos usuarios:
    // - Email de bienvenida
    // - Configuración inicial
    // - Analytics de registro
  }

  @EventPattern('user.login')
  async handleUserLogin(@Payload() data: any) {
    console.log("🔓 [REDIS HANDLER] Usuario hizo login:");
    console.log("📊 [REDIS HANDLER] Datos de login:", data);
    
    // Lógica para login:
    // - Actualizar último acceso
    // - Analytics de actividad
    // - Notificaciones de seguridad
  }

  @EventPattern('weather.data_fetched')
  async handleWeatherDataFetched(@Payload() data: any) {
    this.logger.log("🌤️ [REDIS HANDLER] Datos meteorológicos recibidos:");
    this.logger.log(`📊 [REDIS HANDLER] Post ID: ${data.postId}, Datos: ${JSON.stringify(data.weatherData)}`);
    
    // Aquí puedes añadir lógica adicional como:
    // - Notificar al usuario que los datos meteorológicos están disponibles
    // - Actualizar cache
    // - Analytics de uso del servicio meteorológico
    // - Generar notificación si hay condiciones climáticas extremas
    
    if (data.weatherData) {
      this.logger.log(`✅ [REDIS HANDLER] Datos meteorológicos procesados exitosamente para post ${data.postId}`);
      this.logger.log(`🌡️ Temperatura: ${data.weatherData.temperature}°C, ${data.weatherData.description}`);
    } else {
      this.logger.warn(`⚠️ [REDIS HANDLER] No se pudieron obtener datos meteorológicos para post ${data.postId}`);
      if (data.error) {
        this.logger.error(`❌ Error: ${data.error}`);
      }
    }
  }
}

