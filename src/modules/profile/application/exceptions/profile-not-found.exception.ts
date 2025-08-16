import { CoreException } from '@shared/exceptions/core.exception';

export class ProfileNotFoundException extends CoreException {
  constructor() {
    super('Profile not found', 'PROFILE_NOT_FOUND', 404);
    this.name = 'ProfileNotFoundException';
  }
}
