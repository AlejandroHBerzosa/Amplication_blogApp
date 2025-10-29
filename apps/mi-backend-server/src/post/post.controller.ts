import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { PostService } from "./post.service";
import { PostControllerBase } from "./base/post.controller.base";
import { Post } from "./base/Post";
import { PostWhereUniqueInput } from "./base/PostWhereUniqueInput";
import { PostFindManyArgs } from "./base/PostFindManyArgs";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { Request } from "express";
import { plainToClass } from "class-transformer";
import * as errors from "../errors";

@swagger.ApiTags("posts")
@common.Controller("posts")
export class PostController extends PostControllerBase {
  constructor(
    protected readonly service: PostService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Sobrescribir para siempre incluir weather
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get()
  @swagger.ApiOkResponse({ type: [Post] })
  @nestAccessControl.UseRoles({
    resource: "Post",
    action: "read",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async posts(@common.Req() request: Request): Promise<Post[]> {
    const args = plainToClass(PostFindManyArgs, request.query);
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
  @common.Get("/:id")
  @swagger.ApiOkResponse({ type: Post })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Post",
    action: "read",
    possession: "own",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async post(
    @common.Param() params: PostWhereUniqueInput
  ): Promise<Post | null> {
    const result = await this.service.post({
      where: params,
      include: {
        weather: true,
        user: true,
      },
    });
    if (result === null) {
      throw new errors.NotFoundException(
        `No resource was found for ${JSON.stringify(params)}`
      );
    }
    return result;
  }
}
