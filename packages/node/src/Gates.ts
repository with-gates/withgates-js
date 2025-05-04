import type { IGatesOptions } from "@withgates/core-js";
import { Gates as CoreGates } from "@withgates/core-js";

export interface ExperimentValidationResponse {
  isEnrolled: boolean;
  name: string;
  variant: string;
  parameters: Array<{
    key: string;
    type: string;
    value: string;
  }>;
}

export interface KnobValidationResponse {
  isEnabled: boolean;
  value: string;
}

export interface BulkValidationRequest {
  experiments: string[];
  knobs: string[];
  appUserId: string;
}

export interface BulkValidationResponse {
  experiments: Record<string, ExperimentValidationResponse>;
  knobs: Record<string, KnobValidationResponse>;
}

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
   * Validates if a user is enrolled in an experiment
   * @param experimentKey - The experiment key to validate
   * @param appUserId - Optional user ID to validate against. If not provided, uses the current user's ID
   * @returns Promise that resolves with experiment validation response
   */
  validateExperiment(
    experimentKey: string,
    appUserId?: string
  ): Promise<ExperimentValidationResponse>;

  /**
   * Validates if a knob is enabled and gets its value
   * @param knobKey - The knob key to validate
   * @param appUserId - Optional user ID to validate against. If not provided, uses the current user's ID
   * @returns Promise that resolves with knob validation response
   */
  validateKnob(
    knobKey: string,
    appUserId?: string
  ): Promise<KnobValidationResponse>;

  /**
   * Validates multiple experiments and knobs in a single request
   * @param request - The bulk validation request
   * @param appUserId - Optional user ID to validate against. If not provided, uses the current user's ID
   * @returns Promise that resolves with bulk validation response
   */
  validateBulk(
    request: Omit<BulkValidationRequest, "appUserId">,
    appUserId?: string
  ): Promise<BulkValidationResponse>;
}

export class Gates extends CoreGates implements IGates {
  user?: any = {};
  options?: IGatesOptions | undefined;

  constructor(pubKey: string, options?: IGatesOptions) {
    super(pubKey, options);
    this.user = {
      id: this.options?.appUserId ?? undefined,
    };
    this.options = options;
  }

  async setUserAttributes(
    attributes: Record<string, any>,
    appUserId?: string
  ): Promise<void> {
    const userId = appUserId ?? this.user.id;

    if (!userId) {
      throw new Error(
        "No user ID provided. Please sign in a user or provide an app user ID."
      );
    }

    const response = await this.makeRequest<{
      attributes: Record<string, any>;
    }>(`sdk/user/${userId}/attributes`, "POST", attributes);

    this.user = {
      ...this.user,
      attributes: response.attributes,
    };
  }

  async signInUser(appUserId: string): Promise<void> {
    if (!appUserId) {
      throw new Error(
        "No user ID provided. Please provide a valid app user ID."
      );
    }

    const { id, attributes } = await this.makeRequest<{
      id: string;
      attributes: Record<string, any>;
    }>(`sdk/user/${appUserId}`, "PATCH");

    this.user = {
      id,
      attributes,
    };
  }

  getUser() {
    return this.user;
  }

  async validateExperiment(
    experimentKey: string,
    appUserId?: string
  ): Promise<ExperimentValidationResponse> {
    const userId = appUserId ?? this.user.id;

    if (!userId) {
      throw new Error(
        "No user ID provided. Please sign in a user or provide an app user ID."
      );
    }

    return this.makeRequest<ExperimentValidationResponse>(
      `sdk/validate/experiment/${experimentKey}?appUserId=${userId}`,
      "GET"
    );
  }

  async validateKnob(knobKey: string): Promise<KnobValidationResponse> {
    return this.makeRequest<KnobValidationResponse>(
      `sdk/validate/knob/${knobKey}`,
      "GET"
    );
  }

  async validateBulk(
    request: Omit<BulkValidationRequest, "appUserId">,
    appUserId?: string
  ): Promise<BulkValidationResponse> {
    const userId = appUserId ?? this.user.id;

    if (!userId) {
      throw new Error(
        "No user ID provided. Please sign in a user or provide an app user ID."
      );
    }

    return this.makeRequest<BulkValidationResponse>(
      "sdk/validate/bulk",
      "POST",
      { ...request, appUserId: userId }
    );
  }
}
