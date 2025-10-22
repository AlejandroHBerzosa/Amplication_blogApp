import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WeatherDatumServiceBase } from "./base/weatherDatum.service.base";

@Injectable()
export class WeatherDatumService extends WeatherDatumServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
