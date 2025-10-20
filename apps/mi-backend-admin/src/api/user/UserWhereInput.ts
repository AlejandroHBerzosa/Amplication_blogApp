import { StringFilter } from "../../util/StringFilter";
import { PostListRelationFilter } from "../post/PostListRelationFilter";
import { StringNullableFilter } from "../../util/StringNullableFilter";

export type UserWhereInput = {
  email?: StringFilter;
  id?: StringFilter;
  posts?: PostListRelationFilter;
  username?: StringNullableFilter;
};
