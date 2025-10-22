import { JsonFilter } from "../../util/JsonFilter";
import { StringFilter } from "../../util/StringFilter";
import { PostWhereUniqueInput } from "../post/PostWhereUniqueInput";

export type WeatherDatumWhereInput = {
  currentWeather?: JsonFilter;
  id?: StringFilter;
  posts?: PostWhereUniqueInput;
};
