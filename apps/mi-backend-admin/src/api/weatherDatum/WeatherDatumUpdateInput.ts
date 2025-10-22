import { InputJsonValue } from "../../types";
import { PostWhereUniqueInput } from "../post/PostWhereUniqueInput";

export type WeatherDatumUpdateInput = {
  currentWeather?: InputJsonValue;
  posts?: PostWhereUniqueInput | null;
};
