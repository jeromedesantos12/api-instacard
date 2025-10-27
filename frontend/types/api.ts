export type ApiResponse<T> = {
  status: "success" | "fail" | "error";
  message?: string;
  data: T;
};

export type ApiError = {
  status: "Error";
  message: string;
};
