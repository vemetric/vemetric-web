import { vemetric } from '.';

export type Options = {
  token: string;
  host?: string;
  trackPageViews?: boolean;
  trackOutboundLinks?: boolean;
  trackDataAttributes?: boolean;
  allowCookies?: boolean;
  maskPaths?: string[];
  sdk?: string;
  sdkVersion?: string;
};

export type UserDataProps = {
  set?: object;
  setOnce?: object;
  unset?: Array<string>;
};

export type IdentifyProps = {
  identifier: string;
  displayName?: string;
  data?: UserDataProps;
  allowCookies?: boolean;
};

export type EventProps = {
  eventData?: Record<string, unknown>;
  userData?: UserDataProps;
  beacon?: boolean;
};

export interface IVemetric {
  init(options: Options): boolean;
  trackPageView(): Promise<void>;
  trackPageLeave(): void;
  trackEvent(eventName: string, props?: EventProps): Promise<void>;
  identify(props: IdentifyProps): Promise<void>;
  updateUser(data: UserDataProps): Promise<void>;
  resetUser(): Promise<void>;
  enableTrackPageViews(): void;
  enableTrackOutboundLinks(): void;
  enableTrackDataAttributes(): void;
}

export type VemetricMethod = keyof IVemetric;
export type QueueItem = {
  [K in VemetricMethod]: [K, ...Parameters<IVemetric[K]>];
}[VemetricMethod];

declare global {
  interface Window {
    vmtrcOptions?: Options;
    vmtrcq?: QueueItem[];
    vmtrc?: (...args: QueueItem) => void;
    Vemetric?: typeof vemetric;
  }
}
