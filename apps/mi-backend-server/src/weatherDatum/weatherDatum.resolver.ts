import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { WeatherDatumResolverBase } from "./base/weatherDatum.resolver.base";
import { WeatherDatum } from "./base/WeatherDatum";
import { WeatherDatumService } from "./weatherDatum.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => WeatherDatum)
export class WeatherDatumResolver extends WeatherDatumResolverBase {
  constructor(
    protected readonly service: WeatherDatumService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
