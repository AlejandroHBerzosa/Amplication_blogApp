import { InputJsonValue } from "../../types";
import { PostWhereUniqueInput } from "../post/PostWhereUniqueInput";

export type WeatherDatumCreateInput = {
  currentWeather?: InputJsonValue;
  posts?: PostWhereUniqueInput | null;
};
