import { WeatherDatum as TWeatherDatum } from "../api/weatherDatum/WeatherDatum";

export const WEATHERDATUM_TITLE_FIELD = "id";

export const WeatherDatumTitle = (record: TWeatherDatum): string => {
  return record.id?.toString() || String(record.id);
};
