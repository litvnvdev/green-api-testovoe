import type { Credentials } from '@/shared/api';
import { readJson, removeItem, writeJson } from '@/shared/lib';

const CREDENTIALS_KEY = 'greenApiChat:credentials';

function isCredentials(value: unknown): value is Credentials {
  return (
    typeof value === 'object' &&
    value !== null &&
    'idInstance' in value &&
    typeof value.idInstance === 'string' &&
    'apiTokenInstance' in value &&
    typeof value.apiTokenInstance === 'string' &&
    'apiUrl' in value &&
    typeof value.apiUrl === 'string'
  );
}

export function loadCredentials(): Credentials | null {
  return readJson(CREDENTIALS_KEY, isCredentials);
}

export function saveCredentials(credentials: Credentials): void {
  writeJson(CREDENTIALS_KEY, credentials);
}

export function clearCredentials(): void {
  removeItem(CREDENTIALS_KEY);
}
