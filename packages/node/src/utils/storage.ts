import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = "./.cache";
const STORAGE_FILE = "gates.json";

interface StoredGate {
  id: string;
  value: any;
}

interface StoreData {
  [storeName: string]: StoredGate[];
}

export class GateStorage {
  private static async ensureStorageDir() {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (error) {}
  }

  private static async readStorageFile(): Promise<StoreData> {
    try {
      const data = await fs.readFile(
        path.join(STORAGE_DIR, STORAGE_FILE),
        "utf-8"
      );
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  private static async writeStorageFile(data: StoreData) {
    await fs.writeFile(
      path.join(STORAGE_DIR, STORAGE_FILE),
      JSON.stringify(data, null, 2)
    );
  }

  static async saveGates(storeName: string, gates?: Record<string, boolean>) {
    if (!gates) return;

    await this.ensureStorageDir();
    const data = (await this.readStorageFile()) ?? {};

    data[storeName] = Object.entries(gates).map(([key, value]) => ({
      id: key,
      value,
    }));

    await this.writeStorageFile({ ...data });
  }

  static async loadGates(
    storeName: string
  ): Promise<Record<string, any> | null> {
    try {
      await this.ensureStorageDir();
      const data = await this.readStorageFile();
      const gates = data[storeName] || [];

      return gates.reduce(
        (acc, gate) => ({
          ...acc,
          [gate.id]: gate.value,
        }),
        {}
      );
    } catch (error) {
      return null;
    }
  }

  static async cleanup(storeName: string) {
    try {
      const data = await this.readStorageFile();
      if (data[storeName]) {
        await this.writeStorageFile(data);
      }
    } catch (error) {
      // File doesn't exist or other error
    }
  }
}
