import { retry } from './retry';

declare global {
  interface Window {
    _vmCtx: string | null;
  }
}

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

const DEFAULT_OPTIONS: Options = {
  token: '',
  host: 'https://hub.vemetric.com',
  trackPageViews: true,
  trackOutboundLinks: true,
  trackDataAttributes: true,
  allowCookies: false,
  maskPaths: [],
  sdk: 'web',
  sdkVersion: '%VEMETRIC_SDK_VERSION%',
};

const DATA_ATTRIBUTE_EVENT = 'data-vmtrc';
const KEY_IDENTIFIER = '_vmId';
const KEY_DISPLAY_NAME = '_vmDn';
const KEY_CONTEXT_ID = '_vmCtx';

function getContextId() {
  if (!sessionStorage.getItem(KEY_CONTEXT_ID)) {
    sessionStorage.setItem(KEY_CONTEXT_ID, (Math.random() + '').replace('0.', ''));
  }

  return sessionStorage.getItem(KEY_CONTEXT_ID);
}

function getUserIdentifier() {
  return sessionStorage.getItem(KEY_IDENTIFIER) || undefined;
}

function getUserDisplayName() {
  return sessionStorage.getItem(KEY_DISPLAY_NAME) || undefined;
}

function applyUrlMasking(url: string, maskPaths: string[] = []): string {
  if (maskPaths.length === 0) {
    return url;
  }

  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  const regexMaskPaths = maskPaths.map((url) => new RegExp(`^${url.replace(/\*/g, '[^/]+')}$`));
  for (let i = 0; i < regexMaskPaths.length; i++) {
    if (regexMaskPaths[i].test(pathname)) {
      urlObj.pathname = maskPaths[i];
      return urlObj.toString();
    }
  }
  return url;
}

function getCurrentUrl() {
  return window.location.href;
}

function isLocalhost() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:');
}

function getBasicEventData(options?: Options) {
  const url = getCurrentUrl();
  const maskedUrl = applyUrlMasking(url, options?.maskPaths);

  return {
    url: maskedUrl,
    contextId: getContextId(),
    identifier: getUserIdentifier(),
    displayName: getUserDisplayName(),
  };
}

function getBaseHeaders(options: Options) {
  let hostHeader: string | undefined = undefined;
  if (options.host && options.host !== DEFAULT_OPTIONS.host) {
    hostHeader = options.host;

    if (hostHeader?.startsWith('/')) {
      hostHeader = window.location.host;
    } else {
      hostHeader = new URL(options.host).host;
      if (hostHeader.startsWith('www.')) {
        hostHeader = hostHeader.slice(4);
      }
    }
  }

  return {
    Token: options.token,
    'Allow-Cookies': String(Boolean(options.allowCookies)),
    'V-Host': hostHeader,
    'V-SDK': options.sdk,
    'V-SDK-Version': options.sdkVersion,
  };
}

function getBasicEventHeaders() {
  let referrer = document.referrer || undefined;
  if (referrer === getCurrentUrl()) {
    referrer = undefined;
  }

  return {
    'v-referrer': referrer || undefined,
  };
}

type UserDataProps = {
  set?: object;
  setOnce?: object;
  unset?: Array<string>;
};

type IdentifyProps = {
  identifier: string;
  displayName?: string;
  data?: UserDataProps;
  allowCookies?: boolean;
};

type EventProps = {
  eventData?: Record<string, unknown>;
  userData?: UserDataProps;
  beacon?: boolean;
};

class Vemetric {
  private options: Options = DEFAULT_OPTIONS;
  private isInitialized = false;
  private isIdentifying = false;
  private lastViewedPage?: string;

  init(options: Options) {
    if (this.isInitialized) {
      return;
    }

    if (!options.token || options.token.length < 3) {
      throw new Error('Please provide your Public Token.');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.options.maskPaths?.sort((a, b) => b.length - a.length);
    this.isInitialized = true;

    if (isLocalhost()) {
      console.warn('Vemetric is ignoring requests because it is running on localhost.');
    }

    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
    });

    if (this.options.trackPageViews) {
      this.trackPageView();
      this.enableTrackPageViews();
    }
    if (this.options.trackOutboundLinks) {
      this.enableTrackOutboundLinks();
    }
    if (this.options.trackDataAttributes) {
      this.enableTrackDataAttributes();
    }
  }

  private checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('Vemetric is not initialized yet.');
    }
  }

  private ignoreRequest() {
    if (isLocalhost() || window.location.protocol === 'file:') {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyWindow = window as any;
    if (anyWindow._phantom || anyWindow.__nightmare || window.navigator?.webdriver || anyWindow.Cypress) {
      return true;
    }

    return false;
  }

  private async sendRequest(
    path: string,
    payload?: Record<string, unknown>,
    _headers?: Record<string, string | undefined>,
  ) {
    if (this.ignoreRequest()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('POST', `${this.options.host}${path}`, true);
      req.withCredentials = true;
      req.setRequestHeader('Content-Type', 'application/json');

      const baseHeaders = getBaseHeaders(this.options);
      const headers = { ...baseHeaders, ..._headers };
      Object.entries(headers).forEach(([key, value]) => {
        if (!value) {
          return;
        }

        req.setRequestHeader(key, value);
      });

      req.onload = function () {
        if (req.status >= 200 && req.status < 300) {
          resolve(req.response);
        } else {
          reject({
            status: req.status,
            statusText: req.statusText,
          });
        }
      };
      req.onerror = function () {
        reject({
          status: req.status,
          statusText: req.statusText,
        });
      };

      req.send(payload ? JSON.stringify(payload) : undefined);
    });
  }

  private sendBeacon(path: string, payload?: Record<string, unknown>, _headers?: Record<string, string | undefined>) {
    if (this.ignoreRequest()) {
      return;
    }

    const baseHeaders = getBaseHeaders(this.options);
    const headers = { ...baseHeaders, ..._headers };

    const blob = new Blob([JSON.stringify({ ...payload, ...headers })], {
      type: 'application/json',
    });
    navigator.sendBeacon(`${this.options.host}${path}`, blob);
  }

  async trackPageView() {
    this.checkInitialized();

    const currentUrl = getCurrentUrl();
    if (this.lastViewedPage === currentUrl) {
      return;
    }
    this.lastViewedPage = currentUrl;

    await this.trackEvent('$$pageView');
  }

  trackPageLeave() {
    this.checkInitialized();

    const payload = {
      ...getBasicEventData(this.options),
    };

    this.sendBeacon('/l', payload);
  }

  async trackEvent(eventName: string, props: EventProps = {}) {
    const { eventData, userData, beacon = false } = props;
    this.checkInitialized();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      ...getBasicEventData(this.options),
      name: eventName,
    };
    if (eventData && Object.keys(eventData).length > 0) {
      payload.customData = eventData;
    }
    if (userData && Object.keys(userData).length > 0) {
      payload.userData = userData;
    }

    if (beacon) {
      this.sendBeacon('/e', payload);
    } else {
      const headers = getBasicEventHeaders();
      await this.sendRequest('/e', payload, headers);
    }
  }

  getUserIdentifier() {
    return sessionStorage.getItem(KEY_IDENTIFIER);
  }

  async identify({ identifier, displayName, data, allowCookies: _allowCookies }: IdentifyProps) {
    this.checkInitialized();
    if (this.isIdentifying) {
      return;
    }
    this.isIdentifying = true;

    sessionStorage.setItem(KEY_IDENTIFIER, identifier);
    if (displayName) {
      sessionStorage.setItem(KEY_DISPLAY_NAME, displayName);
    } else {
      sessionStorage.removeItem(KEY_DISPLAY_NAME);
    }

    const payload = {
      identifier,
      displayName,
      data,
    };

    try {
      await this.sendRequest('/i', payload, {
        'Allow-Cookies': String(this.options.allowCookies || _allowCookies || false),
      });
    } catch {
      sessionStorage.removeItem(KEY_IDENTIFIER);
      sessionStorage.removeItem(KEY_DISPLAY_NAME);
    } finally {
      this.isIdentifying = false;
    }
  }

  updateUser(data: UserDataProps) {
    this.checkInitialized();

    retry({
      interval: 1000,
      maxRetries: 5,
      shouldRetry: () => this.isIdentifying,
      callback: () => this.sendRequest('/u', { data }),
    });
  }

  async resetUser() {
    this.checkInitialized();
    sessionStorage.removeItem(KEY_IDENTIFIER);
    sessionStorage.removeItem(KEY_DISPLAY_NAME);
    await this.sendRequest('/r');
  }

  enableTrackPageViews() {
    const pageView = () => this.trackPageView();

    const originalReplaceState = window.history.replaceState;
    if (originalReplaceState) {
      window.history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        pageView();
      };
    }

    const originalPushState = window.history.pushState;
    if (originalPushState) {
      window.history.pushState = function (...args) {
        originalPushState.apply(this, args);
        pageView();
      };
      window.addEventListener('popstate', pageView);
    }

    window.addEventListener('hashchange', pageView);
  }

  enableTrackOutboundLinks() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest) {
        return;
      }

      const link = target.closest('a');
      const href = link?.getAttribute('href');
      if (!href) {
        return;
      }

      const url = new URL(href, getCurrentUrl());
      if (url.origin !== window.location.origin) {
        this.trackEvent('$$outboundLink', { eventData: { href }, beacon: true });
      }
    });
  }

  enableTrackDataAttributes() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest) {
        return;
      }

      const element = target.closest(`[${DATA_ATTRIBUTE_EVENT}]`);
      if (!element) {
        return;
      }

      const eventName = element.getAttribute(DATA_ATTRIBUTE_EVENT);
      if (!eventName) {
        return;
      }

      // Collect custom data from other data attributes
      const customData: Record<string, string> = {};
      for (const attr of element.attributes) {
        if (attr.name.startsWith(`${DATA_ATTRIBUTE_EVENT}-`)) {
          const key = attr.name.slice(`${DATA_ATTRIBUTE_EVENT}-`.length);
          if (key.length === 0 || !attr.value) {
            continue;
          }

          customData[key] = attr.value;
        }
      }

      this.trackEvent(eventName, { eventData: customData });
    });
  }
}

export const vemetric = new Vemetric();
