export class Email {
  private readonly value: string;
  private static readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly maxLength = 254;

  constructor(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue || !Email.emailRegex.test(trimmedValue)) {
      throw new Error('Invalid email format');
    }
    if (trimmedValue.length > Email.maxLength) {
      throw new Error(`Email cannot exceed ${Email.maxLength} characters`);
    }
    this.value = trimmedValue;
  }

  getValue(): string {
    return this.value;
  }
}
