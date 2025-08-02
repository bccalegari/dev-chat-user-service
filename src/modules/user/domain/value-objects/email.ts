export class Email {
  private static readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly maxLength = 254;

  constructor(readonly value: string) {
    const trimmed = value.trim();
    this.validate(trimmed);
    this.value = trimmed;
  }

  private validate(email: string): void {
    if (!email) {
      throw new Error('Email cannot be empty');
    }
    if (!Email.emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    if (email.length > Email.maxLength) {
      throw new Error(`Email cannot exceed ${Email.maxLength} characters`);
    }
  }
}
