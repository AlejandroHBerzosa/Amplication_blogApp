import { JsonFilter } from "../../util/JsonFilter";
import { StringFilter } from "../../util/StringFilter";

export type WeatherDatumWhereInput = {
  data?: JsonFilter;
  id?: StringFilter;
};
