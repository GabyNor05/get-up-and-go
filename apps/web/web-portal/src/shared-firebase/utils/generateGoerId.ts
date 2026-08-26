/**
 * Generates a GoerID in the format: XXXX-00-XX
 * (4 random uppercase letters - 2 random digits - Username first initial + Role first initial)
 */
export function generateGoerId(username: string, role: string = "goer"): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  // 1. Generate 4 random uppercase letters
  let randomLetters = "";
  for (let i = 0; i < 4; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // 2. Generate 2 random digits
  let randomDigits = "";
  for (let i = 0; i < 2; i++) {
    randomDigits += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  // 3. Extract initials (Username initial + Role initial)
  const userInitial = username ? username.trim().charAt(0).toUpperCase() : "X";
  const roleInitial = role ? role.trim().charAt(0).toUpperCase() : "G";

  return `${randomLetters}-${randomDigits}-${userInitial}${roleInitial}`;
}