import { User } from "../user/User";

export type Post = {
  content: string;
  createdAt: Date;
  date: Date | null;
  id: string;
  title: string;
  updatedAt: Date;
  user?: User | null;
};
