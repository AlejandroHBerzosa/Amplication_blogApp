import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";
import { WeatherDatumWhereUniqueInput } from "../weatherDatum/WeatherDatumWhereUniqueInput";

export type PostUpdateInput = {
  content?: string;
  date?: Date | null;
  title?: string;
  user?: UserWhereUniqueInput | null;
  weather?: WeatherDatumWhereUniqueInput | null;
};
