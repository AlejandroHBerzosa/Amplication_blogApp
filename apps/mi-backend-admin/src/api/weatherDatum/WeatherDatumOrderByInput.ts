import { SortOrder } from "../../util/SortOrder";

export type WeatherDatumOrderByInput = {
  createdAt?: SortOrder;
  currentWeather?: SortOrder;
  id?: SortOrder;
  postsId?: SortOrder;
  updatedAt?: SortOrder;
};
