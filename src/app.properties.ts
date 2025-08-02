export const PROPERTIES = {
  KAFKA: {
    KEYCLOAK: {
      USER_TOPIC: 'keycloak.public.user_entity',
      USER_DLQ_TOPIC: 'keycloak.public.user_entity.dlq',
    },
    SCHEMA_REGISTRY: {
      DLQ_SUBJECT: 'DlqPayload-value',
    },
    EVENTS: {
      DLQ_PUBLISHED_EVENT: 'kafka.dlq.published',
    },
  },
  USER: {
    EVENTS: {
      CREATE: {
        NAME: 'user.created',
        OPERATION: 'c',
      },
      UPDATE: {
        NAME: 'user.updated',
        OPERATION: 'u',
      },
      DELETE: {
        NAME: 'user.deleted',
        OPERATION: 'd',
      },
    },
  },
} as const;
