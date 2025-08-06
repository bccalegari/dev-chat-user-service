import { CoreException } from '@shared/exceptions/core.exception';

export class UserNotFoundException extends CoreException {
  constructor() {
    super('User not found', 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundException';
  }
}
