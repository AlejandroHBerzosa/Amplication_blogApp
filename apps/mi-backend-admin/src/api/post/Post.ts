import { User } from "../user/User";
import { WeatherDatum } from "../weatherDatum/WeatherDatum";

export type Post = {
  content: string;
  createdAt: Date;
  date: Date | null;
  id: string;
  title: string;
  updatedAt: Date;
  user?: User | null;
  weather?: WeatherDatum | null;
};
