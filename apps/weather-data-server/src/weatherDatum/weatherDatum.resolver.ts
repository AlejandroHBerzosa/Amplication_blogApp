import * as graphql from "@nestjs/graphql";
import { WeatherDatumResolverBase } from "./base/weatherDatum.resolver.base";
import { WeatherDatum } from "./base/WeatherDatum";
import { WeatherDatumService } from "./weatherDatum.service";

@graphql.Resolver(() => WeatherDatum)
export class WeatherDatumResolver extends WeatherDatumResolverBase {
  constructor(protected readonly service: WeatherDatumService) {
    super(service);
  }
}
