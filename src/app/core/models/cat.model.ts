export interface CatInfo {
  name: string;
  age: string;
  description: string;
}

export interface CatRaw {
  id: string;
  info: CatInfo;
}

export interface ListResponse {
  status_code: number;
  data: CatRaw[];
}

// Flat shape we use in the UI
export interface Cat {
  id: string;
  name: string;
  age: string;
  description: string;
}

export interface CreateCatDto {
  name: string;
  age: string;
  description: string;
}