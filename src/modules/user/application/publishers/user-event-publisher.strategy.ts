import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';
import { KafkaMessage } from '@shared/kafka/kafka-message';

export interface UserEventPublisherStrategy {
  supports(operation: string): boolean;
  handle(
    event: UserChangeEventValue | null,
    kafkaMessage: KafkaMessage,
  ): Promise<void>;
}

export const USER_EVENT_STRATEGY = Symbol('UserEventStrategy');
