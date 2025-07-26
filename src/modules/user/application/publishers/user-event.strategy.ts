export interface UserEventStrategy {
  supports(operation: string): boolean;
  handle(event: Record<string, any>): Promise<void>;
}

export const USER_EVENT_STRATEGY = Symbol('UserEventStrategy');
