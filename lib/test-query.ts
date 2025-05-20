
import { query } from './test-db';

interface User {
  id: number;
  name: string;
  email: string;
}

export default async function handler() {
  try {
    const result = await query<User>('SELECT * FROM users');
    return result.rows
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return message;
  }
}