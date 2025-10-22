import { SortOrder } from "../../util/SortOrder";

export type WeatherDatumOrderByInput = {
  createdAt?: SortOrder;
  data?: SortOrder;
  id?: SortOrder;
  updatedAt?: SortOrder;
};
