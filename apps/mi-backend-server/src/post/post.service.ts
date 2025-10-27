import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PostServiceBase } from "./base/post.service.base";
import { Prisma, Post as PrismaPost } from "@prisma/client";
import { RedisProducerService } from "../redis/redis.producer.service";
import { MessageBrokerTopics } from "../redis/topics";

@Injectable()
export class PostService extends PostServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly redisProducer: RedisProducerService
  ) {
    super(prisma);
  }

  // Sobrescribir método para crear post con logging
  async createPost(args: Prisma.PostCreateArgs): Promise<PrismaPost> {
    console.log("🚀 [POST SERVICE] Iniciando creación de post...");
    console.log("📝 [POST SERVICE] Datos del post a crear:", {
      title: args.data.title,
      content: args.data.content?.substring(0, 100) + "...", // Solo primeros 100 caracteres
      userId: args.data.user?.connect?.id,
      timestamp: new Date().toISOString()
    });

    try {
      const createdPost = await super.createPost(args);
      
      console.log("✅ [POST SERVICE] Post creado exitosamente:");
      console.log("📄 [POST SERVICE] Post creado:", {
        id: createdPost.id,
        title: createdPost.title,
        createdAt: createdPost.createdAt,
        userId: createdPost.userId
      });

      // 🚀 ENVIAR EVENTO A REDIS
      try {
        await this.redisProducer.emitMessage(
          MessageBrokerTopics.POST_CREATED,
          {
            id: createdPost.id,
            title: createdPost.title,
            content: createdPost.content,
            userId: createdPost.userId,
            createdAt: createdPost.createdAt,
            timestamp: new Date().toISOString()
          }
        );
        console.log("📨 [REDIS] Evento POST_CREATED enviado exitosamente");
      } catch (redisError) {
        console.error("❌ [REDIS] Error enviando evento POST_CREATED:", redisError);
        // No fallar la creación del post por error de Redis
      }

      return createdPost;
    } catch (error) {
      console.error("❌ [POST SERVICE] Error al crear post:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Sobrescribir método para obtener un post específico con logging
  async post(args: Prisma.PostFindUniqueArgs): Promise<PrismaPost | null> {
    console.log("👀 [POST SERVICE] Solicitando visualización de post...");
    console.log("🔍 [POST SERVICE] Buscando post:", {
      postId: args.where.id,
      includeRelations: !!args.include,
      timestamp: new Date().toISOString()
    });

    try {
      const foundPost = await super.post(args);
      
      if (foundPost) {
        console.log("📖 [POST SERVICE] Post encontrado y mostrado:");
        console.log("📊 [POST SERVICE] Detalles del post visualizado:", {
          id: foundPost.id,
          title: foundPost.title,
          viewedAt: new Date().toISOString(),
          hasUser: !!foundPost.userId
        });

        // 🚀 ENVIAR EVENTO A REDIS para tracking de visualizaciones
        try {
          await this.redisProducer.emitMessage(
            MessageBrokerTopics.POST_VIEWED,
            {
              id: foundPost.id,
              title: foundPost.title,
              userId: foundPost.userId,
              viewedAt: new Date().toISOString()
            }
          );
          console.log("📨 [REDIS] Evento POST_VIEWED enviado exitosamente");
        } catch (redisError) {
          console.error("❌ [REDIS] Error enviando evento POST_VIEWED:", redisError);
        }
      } else {
        console.log("❓ [POST SERVICE] Post no encontrado para ID:", args.where.id);
      }

      return foundPost;
    } catch (error) {
      console.error("❌ [POST SERVICE] Error al obtener post:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Sobrescribir método para obtener múltiples posts con logging
  async posts(args: Prisma.PostFindManyArgs): Promise<PrismaPost[]> {
    console.log("📋 [POST SERVICE] Solicitando lista de posts...");
    console.log("🔍 [POST SERVICE] Parámetros de búsqueda:", {
      skip: args.skip || 0,
      take: args.take || "all",
      hasFilters: !!args.where,
      hasOrderBy: !!args.orderBy,
      timestamp: new Date().toISOString()
    });

    try {
      const foundPosts = await super.posts(args);
      
      console.log("📚 [POST SERVICE] Posts obtenidos exitosamente:");
      console.log("📈 [POST SERVICE] Resultados:", {
        totalPosts: foundPosts.length,
        firstPostTitle: foundPosts.length > 0 ? foundPosts[0].title : "N/A",
        retrievedAt: new Date().toISOString()
      });

      return foundPosts;
    } catch (error) {
      console.error("❌ [POST SERVICE] Error al obtener posts:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
