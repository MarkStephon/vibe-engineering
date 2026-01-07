import { apiClient } from "./client";
import { CardData } from "@/types";

export interface ParseRequest {
  url: string;
}

export interface ParseResponse {
  id: string;
  url: string;
  title: string;
  author: string;
  summary: string[];
  thumbnail_url?: string;
  status: "SUCCESS" | "FAILED";
  error_code?: string;
}

export const contentApi = {
  parseUrl: (url: string) =>
    apiClient.post<ParseResponse>("/parse", { url }),
};