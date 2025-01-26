import { openDB } from 'idb';

const DB_NAME = 'gates-store';
const DB_VERSION = 1;
const STORES = ['knobs', 'experiments'];
const GATE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredGate {
  id: string;
  value: any;
  timestamp: number;
}

export class GateStorage {
  static async init() {
    await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      },
    });
  }

  static async saveGates(storeName: string, gates?: Record<string, boolean>) {
    if (!STORES.includes(storeName)) {
      throw new Error(`Invalid store name: ${storeName}`);
    }

    if (!gates) {
      return;
    }

    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    const timestamp = Date.now();

    await Promise.all(
      Object.entries(gates).map(([key, value]) =>
        store.put({
          id: key,
          value,
          timestamp,
        })
      )
    );

    await tx.done;
  }

  static async loadGates(
    storeName: string
  ): Promise<Record<string, any> | null> {
    if (!STORES.includes(storeName)) {
      throw new Error(`Invalid store name: ${storeName}`);
    }

    const db = await openDB(DB_NAME, DB_VERSION);
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);

    const gates = await store.getAll();

    const now = Date.now();
    const validGates = gates.filter((g) => now - g.timestamp < GATE_TTL);

    if (validGates.length === 0) {
      return null;
    }

    return validGates.reduce(
      (acc, gate) => ({
        ...acc,
        [gate.id]: gate.value,
      }),
      {}
    );
  }

  static async cleanup(storeName: string) {
    if (!STORES.includes(storeName)) {
      throw new Error(`Invalid store name: ${storeName}`);
    }

    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    const now = Date.now();
    const gates = await store.getAll();

    await Promise.all(
      gates.map((gate) => {
        if (now - gate.timestamp > GATE_TTL) {
          store.delete(gate.id);
        }
      })
    );

    await tx.done;
  }

  // Cleanup all stale entries across all stores
  static async cleanupAll() {
    for (const store of STORES) {
      await this.cleanup(store);
    }
  }
}
