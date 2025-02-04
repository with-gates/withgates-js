export const API = "https://with-gates.fly.dev";

/**
 * Configuration options for Gates instance
 */
export interface IGatesOptions {
  /** Unique identifier for the application user */
  appUserId?: string;
  /** Force fetch fresh data instead of using cache */
  alwaysFetch?: boolean;

  /** Optional salt value used for hashing */
  salt?: string;
}

/**
 * Core Gates interface defining main functionality
 */
export interface IGates {
  /**
   * Get or create a Gates instance
   * @param pubKey - Public API key for authentication
   * @param options - Configuration options
   * @returns Gates instance
   */
  getInstance(pubKey: string, options?: IGatesOptions): IGates;

  /**
   * Make an HTTP request to the Gates API
   * @param endpoint - API endpoint path
   * @param method - HTTP method to use
   * @param data - Optional request payload
   * @returns Promise resolving to response data
   */
  makeRequest<T>(endpoint: string, method: string, data?: any): Promise<T>;
}

/**
 * Response structure from Gates API
 */
export interface GatesResponse {
  /** Feature flag states */
  knobs?: Record<string, boolean>;
  /** Experiment states */
  experiments?: Record<string, boolean>;
}

/**
 * User information interface
 * @todo Add user-related properties
 */
export interface IUser {}

export class Gates implements IGates {
  pubKey: string;
  options?: IGatesOptions;
  private static instance: IGates;
  salt!: string;

  constructor(pubKey: string, options?: IGatesOptions) {
    this.pubKey = pubKey;
    this.options = options;
    this.salt = options?.salt ?? "gates";
  }

  getInstance(pubKey: string, options?: IGatesOptions): IGates {
    if (!Gates.instance) {
      Gates.instance = new Gates(pubKey, options);
    }

    return Gates.instance;
  }

  async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH",
    data?: any
  ): Promise<T> {
    const response = await fetch(`${API}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.pubKey}`,
        "Content-Type": "application/json",
        "x-fg-s": this.salt,
      },
      method,
      body: data ? JSON.stringify(data) : undefined,
    });

    return (await response.json()) as T;
  }
}
