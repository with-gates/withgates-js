import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = "./.cache";
const STORAGE_FILE = "gates.json";

type ExpectedStores = "knobs" | "experiments";

type StoreData = {
  [storeName in ExpectedStores]?: Record<string, boolean>;
};

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
    } catch (error: unknown) {
      return {};
    }
  }

  private static async writeStorageFile(data: StoreData) {
    await fs.writeFile(
      path.join(STORAGE_DIR, STORAGE_FILE),
      JSON.stringify(data, null, 2)
    );
  }

  static async saveGates(
    storeName: ExpectedStores,
    gates?: Record<string, boolean>
  ) {
    if (!gates) return;

    await this.ensureStorageDir();
    const data = (await this.readStorageFile()) ?? {};

    data[storeName] = gates;

    await this.writeStorageFile({ ...data });
  }

  static async loadGates(
    storeName: ExpectedStores
  ): Promise<Record<string, boolean> | null> {
    try {
      await this.ensureStorageDir();
      const data = await this.readStorageFile();
      return data[storeName] || null;
    } catch (error) {
      return null;
    }
  }

  static async loadAll(): Promise<StoreData> {
    try {
      await this.ensureStorageDir();
      const data = await this.readStorageFile();
      return data;
    } catch (error) {
      return {};
    }
  }

  static async cleanup(storeName: ExpectedStores) {
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
