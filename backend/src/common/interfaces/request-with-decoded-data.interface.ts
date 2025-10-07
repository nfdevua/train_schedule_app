export interface RequestWithDecodedData {
  headers: {
    authorization?: string;
  };
  user?: {
    id: string;
    role: string;
  };
}
