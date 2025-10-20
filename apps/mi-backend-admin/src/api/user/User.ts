import { Post } from "../post/Post";

export type User = {
  createdAt: Date;
  email: string;
  id: string;
  posts?: Array<Post>;
  updatedAt: Date;
  username: string | null;
};
