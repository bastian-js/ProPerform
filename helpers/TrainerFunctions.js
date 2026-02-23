import crypto from "crypto";

function generateTrainerCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomChars = (len) =>
    Array.from(crypto.randomFillSync(new Uint8Array(len)))
      .map((x) => chars[x % chars.length])
      .join("");

  return `TRN-${randomChars(3)}-${randomChars(3)}`;
}

console.log(generateTrainerCode());

export { generateTrainerCode };
