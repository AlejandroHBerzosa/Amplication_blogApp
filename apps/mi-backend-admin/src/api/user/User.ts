import { Post } from "../post/Post";
import { JsonValue } from "type-fest";

export type User = {
  createdAt: Date;
  email: string;
  id: string;
  posts?: Array<Post>;
  roles: JsonValue;
  updatedAt: Date;
  username: string | null;
};
