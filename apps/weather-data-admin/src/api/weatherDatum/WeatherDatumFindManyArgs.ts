import { WeatherDatumWhereInput } from "./WeatherDatumWhereInput";
import { WeatherDatumOrderByInput } from "./WeatherDatumOrderByInput";

export type WeatherDatumFindManyArgs = {
  where?: WeatherDatumWhereInput;
  orderBy?: Array<WeatherDatumOrderByInput>;
  skip?: number;
  take?: number;
};
