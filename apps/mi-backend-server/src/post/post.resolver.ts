import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { PostResolverBase } from "./base/post.resolver.base";
import { Post } from "./base/Post";
import { PostService } from "./post.service";
import { PostFindManyArgs } from "./base/PostFindManyArgs";
import { PostFindUniqueArgs } from "./base/PostFindUniqueArgs";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Post)
export class PostResolver extends PostResolverBase {
  constructor(
    protected readonly service: PostService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Sobrescribir para siempre incluir weather
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [Post])
  @nestAccessControl.UseRoles({
    resource: "Post",
    action: "read",
    possession: "any",
  })
  async posts(@graphql.Args() args: PostFindManyArgs): Promise<Post[]> {
    return this.service.posts({
      ...args,
      include: {
        weather: true,
        user: true,
      },
    });
  }

  // Sobrescribir para siempre incluir weather
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => Post, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "Post",
    action: "read",
    possession: "own",
  })
  async post(@graphql.Args() args: PostFindUniqueArgs): Promise<Post | null> {
    const result = await this.service.post({
      ...args,
      include: {
        weather: true,
        user: true,
      },
    });
    if (result === null) {
      return null;
    }
    return result;
  }
}
