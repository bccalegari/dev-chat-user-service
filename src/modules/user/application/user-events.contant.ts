export const USER_EVENTS_OPERATIONS = {
  create: 'c',
  update: 'u',
  delete: 'd',
} as const;

export const USER_EVENTS = {
  create: 'user.created',
  update: 'user.updated',
  delete: 'user.deleted',
} as const;
