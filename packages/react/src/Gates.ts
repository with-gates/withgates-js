import type { GatesResponse, IGatesOptions } from '@withgates/core-js';
import { Gates as CoreGates } from '@withgates/core-js';
import { GateStorage } from './utils/storage';

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
   * Initializes the Gates instance by loading stored gates from local storage
   * and optionally syncing with the server
   * @returns Promise that resolves when initialization is complete
   */
  init(): Promise<void>;
}

export class Gates extends CoreGates implements IGates {
  store?: GatesResponse;
  user?: any = {};

  constructor(pubKey: string, options?: IGatesOptions) {
    super(pubKey, options);
    this.store = {};
    this.user = {
      id: this.options?.appUserId ?? undefined,
    };
  }

  async init(): Promise<void> {
    await GateStorage.init();

    const [storedKnobs, storedExperiments] = await Promise.all([
      GateStorage.loadGates('knobs'),
      GateStorage.loadGates('experiments'),
    ]);

    const hasLocalData = storedKnobs || storedExperiments;
    const refresh = this.options?.alwaysFetch ?? true;

    if (hasLocalData && !refresh) {
      this.store = {
        knobs: storedKnobs ?? {},
        experiments: storedExperiments ?? {},
      };

      return;
    }

    await this.sync();
  }

  async setUserAttributes(attributes: Record<string, any>): Promise<void> {
    const response = await this.makeRequest<{
      attributes: Record<string, any>;
    }>(`sdk/user/${this.user.id}/attributes`, 'POST', attributes);

    this.user = {
      ...this.user,
      attributes: response.attributes,
    };
  }

  async signInUser(appUserId: string): Promise<void> {
    const { id, attributes } = await this.makeRequest<{
      id: string;
      attributes: Record<string, any>;
    }>(`sdk/user/${appUserId}`, 'PATCH');

    this.user = {
      id,
      attributes,
    };
  }

  async sync() {
    const request = await this.makeRequest<GatesResponse>(
      `sdk/gates?keys=knobs&experiments&userId=${this.user.id}`,
      'GET'
    );

    this.store = request;

    await Promise.all([
      GateStorage.saveGates('knobs', request.knobs),
      GateStorage.saveGates('experiments', request.experiments),
    ]);
  }

  getUser() {
    return this.user;
  }
}
