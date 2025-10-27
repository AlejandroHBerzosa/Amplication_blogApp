// Topics disponibles para el message broker Redis
export enum MessageBrokerTopics {
  // Posts
  POST_CREATED = "post.created",
  POST_UPDATED = "post.updated",
  POST_DELETED = "post.deleted",
  POST_VIEWED = "post.viewed",
  
  // Users
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  USER_LOGIN = "user.login",
  
  // Weather
  WEATHER_UPDATED = "weather.updated",
  
  // System
  SYSTEM_HEALTH_CHECK = "system.health_check",
}

// Union type de todos los topics disponibles
export type AllMessageBrokerTopics = MessageBrokerTopics;

// Exportar también como default
export default MessageBrokerTopics;