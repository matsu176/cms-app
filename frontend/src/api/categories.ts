import axios from "axios";
import type { Category } from "../types/category";

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get<Category[]>("/api/categories");
  return res.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const res = await axios.post<Category>("/api/categories", { name });
  return res.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`/api/categories/${id}`);
};