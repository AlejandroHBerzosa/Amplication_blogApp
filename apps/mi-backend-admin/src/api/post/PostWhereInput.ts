import { StringFilter } from "../../util/StringFilter";
import { DateTimeNullableFilter } from "../../util/DateTimeNullableFilter";
import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";
import { WeatherDatumWhereUniqueInput } from "../weatherDatum/WeatherDatumWhereUniqueInput";

export type PostWhereInput = {
  content?: StringFilter;
  date?: DateTimeNullableFilter;
  id?: StringFilter;
  title?: StringFilter;
  user?: UserWhereUniqueInput;
  weather?: WeatherDatumWhereUniqueInput;
};
