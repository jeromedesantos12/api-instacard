export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  emailOrUsername: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  theme: string | null;
};

export type UserLite = {
  id: string;
  name: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type RegisterResponse = {
  status: "Success";
  message: string;
  data: UserLite;
};

export type VerifyData = { id: string };
