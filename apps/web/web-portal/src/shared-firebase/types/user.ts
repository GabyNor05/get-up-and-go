import { Timestamp } from "firebase/firestore";

export type UserRole = "goer" | "partner" | "admin";

export interface User {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface CreateUserData {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
}