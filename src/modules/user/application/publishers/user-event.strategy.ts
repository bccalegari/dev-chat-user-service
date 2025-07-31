import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';

export interface UserEventStrategy {
  supports(operation: string): boolean;
  handle(event: UserChangeEventValue | null): Promise<void>;
}

export const USER_EVENT_STRATEGY = Symbol('UserEventStrategy');
