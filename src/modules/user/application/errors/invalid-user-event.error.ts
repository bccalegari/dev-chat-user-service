export class InvalidUserEventError extends Error {
  constructor(message?: string) {
    super(message || 'Invalid user event data');
    this.name = 'InvalidUserEventError';
  }
}
