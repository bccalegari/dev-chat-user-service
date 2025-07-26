export interface EventPublisher {
  publish(event: Record<string, any>): Promise<void>;
}
