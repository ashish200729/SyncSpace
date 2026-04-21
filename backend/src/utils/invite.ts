import { randomBytes } from "node:crypto";
import { appConfig } from "../config/env.js";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const getRandomAlphabetCharacter = () => {
  const index = randomBytes(1)[0] % INVITE_CODE_ALPHABET.length;
  return INVITE_CODE_ALPHABET[index];
};

export const createInviteCode = (length = 8) => {
  return Array.from({ length }, getRandomAlphabetCharacter).join("");
};

export const createInviteToken = () => {
  return randomBytes(24).toString("base64url");
};

export const buildInviteLink = (inviteToken: string | null) => {
  if (!inviteToken) {
    return null;
  }

  return `${appConfig.frontendURL}/join/${inviteToken}`;
};
