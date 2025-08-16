import { CoreException } from '@shared/exceptions/core.exception';

export class ProfileAlreadyExistsException extends CoreException {
  constructor() {
    super('Profile already exists', 'PROFILE_ALREADY_EXISTS', 409);
    this.name = 'ProfileAlreadyExistsException';
  }
}
