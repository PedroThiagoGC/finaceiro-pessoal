import type { Account, Card, Category, Transaction } from '@pwr/types';
import Dexie, { Table } from 'dexie';

export class PWRDatabase extends Dexie {
  transactions!: Table<Transaction & { syncStatus?: 'pending' | 'synced' }>;
  accounts!: Table<Account>;
  categories!: Table<Category>;
  cards!: Table<Card>;

  constructor() {
    super('PWRFinancas');

    this.version(1).stores({
      transactions: 'id, userId, date, categoryId, cardId, accountId, syncStatus',
      accounts: 'id, userId',
      categories: 'id, userId',
      cards: 'id, userId',
    });
  }
}

export const db = new PWRDatabase();

// Sync pending transactions
export async function syncPendingTransactions() {
  const pending = await db.transactions.where('syncStatus').equals('pending').toArray();

  for (const tx of pending) {
    try {
      // Send to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(tx),
      });

      if (response.ok) {
        await db.transactions.update(tx.id, { syncStatus: 'synced' });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}
