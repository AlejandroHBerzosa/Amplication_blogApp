import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PostModuleBase } from "./base/post.module.base";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { PostResolver } from "./post.resolver";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [PostModuleBase, forwardRef(() => AuthModule), RedisModule],
  controllers: [PostController],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}
