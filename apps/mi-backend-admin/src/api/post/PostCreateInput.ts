import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";
import { WeatherDatumWhereUniqueInput } from "../weatherDatum/WeatherDatumWhereUniqueInput";

export type PostCreateInput = {
  content: string;
  date?: Date | null;
  title: string;
  user?: UserWhereUniqueInput | null;
  weather?: WeatherDatumWhereUniqueInput | null;
};
