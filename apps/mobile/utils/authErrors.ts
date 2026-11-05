/** Turns Firebase Auth errors into short, friendly messages */
export function friendlyAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return "That email and password don't match. Try again.";
    case 'auth/invalid-email':
      return "That email address doesn't look right.";
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/missing-password':
      return 'Enter your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return "You're offline. Check your connection and try again.";
    default:
      return 'Something went wrong. Please try again.';
  }
}
