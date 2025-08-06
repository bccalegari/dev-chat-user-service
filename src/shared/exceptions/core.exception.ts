export class CoreException extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string = 'INTERNAL_SERVER_ERROR',
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'CoreException';
  }
}
