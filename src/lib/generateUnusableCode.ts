import { hashPassword } from "./hashPassword";
import crypto from "crypto";

async function generateUnusablePasswordHash() {
  return hashPassword(crypto.randomBytes(16).toString("hex"));
}

export default generateUnusablePasswordHash;
