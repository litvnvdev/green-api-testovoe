import { credentialsSchema, type Credentials } from '@/shared/api';
import { readJson, removeItem, writeJson } from '@/shared/lib';

const CREDENTIALS_KEY = 'greenApiChat:credentials';

export function loadCredentials(): Credentials | null {
  return readJson(CREDENTIALS_KEY, credentialsSchema);
}

export function saveCredentials(credentials: Credentials): void {
  writeJson(CREDENTIALS_KEY, credentials);
}

export function clearCredentials(): void {
  removeItem(CREDENTIALS_KEY);
}
