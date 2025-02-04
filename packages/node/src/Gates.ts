import type { GatesResponse, IGatesOptions } from "@withgates/core-js";
import { Gates as CoreGates } from "@withgates/core-js";
import { GateStorage } from "./utils/storage";
import { hashKey } from "./utils/hash";

interface IGates {
  /**
   * Sets user attributes for the current user
   * @param attributes - Key-value pairs of user attributes to set
   * @returns Promise that resolves when attributes are successfully set
   */
  setUserAttributes(attributes: Record<string, any>): Promise<void>;

  /**
   * Signs in a user with the given app user ID
   * @param appUserId - Unique identifier for the user in the application
   * @returns Promise that resolves when user is successfully signed in
   */
  signInUser(appUserId: string): Promise<void>;

  /**
   * Retrieves the current user information
   * @returns Promise that resolves with the current user data
   */
  getUser(): Promise<any>;

  /**
   * Initializes the Gates instance by loading stored gates
   * and optionally syncing with the server
   * @returns Promise that resolves when initialization is complete
   */
  init(): Promise<void>;

  /**
   * Checks if a feature flag is enabled
   * @param key - The feature flag key to check
   * @returns boolean indicating if the flag is enabled
   */
  isEnabled(key: string): boolean;

  /**
   * Checks if a user is part of an experiment
   * @param key - The experiment key to check
   * @returns boolean indicating if the user is in the experiment
   */
  isInExperiment(key: string): boolean;
}

export class Gates extends CoreGates implements IGates {
  store?: GatesResponse;
  user?: any = {};
  options?: IGatesOptions | undefined;

  constructor(pubKey: string, options?: IGatesOptions) {
    super(pubKey, options);
    this.store = {};
    this.user = {
      id: this.options?.appUserId ?? undefined,
    };

    this.options = options;
  }

  async init(): Promise<void> {
    const store = await GateStorage.loadAll();

    const hasLocalData = store["knobs"] || store["experiments"];
    const refresh = this.options?.alwaysFetch ?? true;

    if (hasLocalData && !refresh) {
      this.store = store;
      return;
    }

    await this.sync();
  }

  async setUserAttributes(attributes: Record<string, any>): Promise<void> {
    const response = await this.makeRequest<{
      attributes: Record<string, any>;
    }>(`sdk/user/${this.user.id}/attributes`, "POST", attributes);

    this.user = {
      ...this.user,
      attributes: response.attributes,
    };
  }

  async signInUser(appUserId: string): Promise<void> {
    const { id, attributes } = await this.makeRequest<{
      id: string;
      attributes: Record<string, any>;
    }>(`sdk/user/${appUserId}`, "PATCH");

    this.user = {
      id,
      attributes,
    };

    await this.sync();
  }

  async sync() {
    const request = await this.makeRequest<GatesResponse>(
      `sdk/gates?keys=knobs,experiments&userId=${this.user.id}`,
      "GET"
    );

    const currentStore = await GateStorage.loadAll();

    // Todo: implement deep equality check.
    const shouldReplace =
      JSON.stringify(currentStore) !== JSON.stringify(request);

    if (shouldReplace) {
      this.store = request;
      await GateStorage.saveGates("knobs", request.knobs);
      await GateStorage.saveGates("experiments", request.experiments);
    } else {
      this.store = currentStore;
    }
  }

  getUser() {
    return this.user;
  }

  isEnabled(key: string): boolean {
    const hashedKey = hashKey(key, this.salt);
    return this.store?.knobs?.[hashedKey] ?? false;
  }

  isInExperiment(key: string): boolean {
    const hashedKey = hashKey(key, this.salt);
    return this.store?.experiments?.[hashedKey] ?? false;
  }
}
