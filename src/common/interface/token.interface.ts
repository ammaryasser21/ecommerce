import { JwtPayload, SignOptions } from "jsonwebtoken";
import { Role } from "../enums/role.js";


export type TokenAudience = "user" | "admin";

export type TokenSecrets = {
  accessSecret: string;
  refreshSecret: string;
};

export type TokenPayload = JwtPayload & {
  id: string;
  role: Role;
  jti: string;
};

export type GenerateTokenOptions = {
  data?: any;
  secret: string;
  expiresIn?: SignOptions["expiresIn"];
  audience?: string | string[];
};

export type VerifyTokenSuccess = {
  success: true;
  payload: TokenPayload;
  error: null;
};

export type VerifyTokenFailure = {
  success: false;
  payload: null;
  error: string;
  message: string;
};

export type VerifyTokenResult =
  | VerifyTokenSuccess
  | VerifyTokenFailure;

export type UserCredentialsInput = {
  _id: string;
  role: Role;
};

export type Credentials = {
  accessToken: Promise<string>;
  refreshToken:  Promise<string>;
};