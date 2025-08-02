export class InvalidUserEventError extends Error {
  constructor(error: Error) {
    super('Invalid user event data');
    this.name = 'InvalidUserEventError';
    this.stack += '\nCaused by: ' + error.stack;
  }
}
