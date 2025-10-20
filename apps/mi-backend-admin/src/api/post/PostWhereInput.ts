import { StringFilter } from "../../util/StringFilter";
import { DateTimeNullableFilter } from "../../util/DateTimeNullableFilter";
import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type PostWhereInput = {
  content?: StringFilter;
  date?: DateTimeNullableFilter;
  id?: StringFilter;
  title?: StringFilter;
  user?: UserWhereUniqueInput;
};
