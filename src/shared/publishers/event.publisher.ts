export interface EventPublisher<T> {
  publish(event: T): Promise<void>;
}
