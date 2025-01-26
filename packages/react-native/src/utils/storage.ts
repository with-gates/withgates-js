import { MMKV } from "react-native-mmkv";

const storage = new MMKV({
  id: "gates-store",
});

const GATE_TTL = 24 * 60 * 60 * 1000;

export interface StoredGate {
  id: string;
  value: any;
  timestamp: number;
}

export class GateStorage {
  static async saveGates(storeName: string, gates?: Record<string, boolean>) {
    if (!gates) {
      return;
    }

    const timestamp = Date.now();
    const storedGates = Object.entries(gates).map(([key, value]) => ({
      id: key,
      value,
      timestamp,
    }));

    storage.set(`${storeName}`, JSON.stringify(storedGates));
  }

  static async loadGates(
    storeName: string
  ): Promise<Record<string, any> | null> {
    const storedData = storage.getString(`${storeName}`);
    if (!storedData) {
      return null;
    }

    const gates = JSON.parse(storedData) as StoredGate[];
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
    const storedData = storage.getString(`${storeName}`);
    if (!storedData) {
      return;
    }

    const gates = JSON.parse(storedData) as StoredGate[];
    const now = Date.now();
    const validGates = gates.filter((g) => now - g.timestamp < GATE_TTL);

    storage.set(`${storeName}`, JSON.stringify(validGates));
  }

  static async cleanupAll() {
    await Promise.all([this.cleanup("knobs"), this.cleanup("experiments")]);
  }
}
