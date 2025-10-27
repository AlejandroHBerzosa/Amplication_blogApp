import { EventPattern, Payload } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";
import { RedisMessage } from "./redisMessage";

@Controller("redis-controller")
export class RedisController {
  
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
}
