import axios from "axios";
import type { Tag } from "../types/tag";

export const fetchTags = async (): Promise<Tag[]> => {
  const res = await axios.get<Tag[]>("/api/tags");
  return res.data;
};

export const deleteTag = async (id: number): Promise<void> => {
  await axios.delete(`/api/tags/${id}`);
};