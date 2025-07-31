export const PROPERTIES = {
  KAFKA: {
    KEYCLOAK_USER_TOPIC: 'keycloak.public.user_entity',
    KEYCLOAK_USER_DLQ_TOPIC: 'keycloak.public.user_entity.dlq',
    SCHEMA_REGISTRY: {
      DLQ_SUBJECT: 'DlqPayload-value',
    },
  },
} as const;
