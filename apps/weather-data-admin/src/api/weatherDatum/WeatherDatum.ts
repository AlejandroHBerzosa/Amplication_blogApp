import { JsonValue } from "type-fest";

export type WeatherDatum = {
  createdAt: Date;
  data: JsonValue;
  id: string;
  updatedAt: Date;
};
