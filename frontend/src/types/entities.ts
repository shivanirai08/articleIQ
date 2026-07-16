/** Mirror of backend/app/schemas/entities.py (CP13) */

import type { ArticleTextRequest } from "@/types/common";

export type EntitiesRequest = ArticleTextRequest;

export type EntityItem = {
  text: string;
  label: string;
  start: number;
  end: number;
};

export type EntitiesResponse = {
  entities: EntityItem[];
  spacy_model: string;
  original_length: number;
  cleaned_length: number;
  entity_count: number;
  unique_labels: string[];
};
