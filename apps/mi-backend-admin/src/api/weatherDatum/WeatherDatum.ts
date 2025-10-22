import { JsonValue } from "type-fest";
import { Post } from "../post/Post";

export type WeatherDatum = {
  createdAt: Date;
  currentWeather: JsonValue;
  id: string;
  posts?: Post | null;
  updatedAt: Date;
};
