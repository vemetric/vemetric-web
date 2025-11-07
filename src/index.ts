import type {
  EventProps,
  IdentifyProps,
  IVemetric,
  Options as InternalOptions,
  QueueItem,
  UpdateUserProps,
} from './types';
import { getUserIdentifier } from './util';

export type Options = InternalOptions & { scriptUrl?: string };

if (typeof window !== 'undefined') {
  window.vmtrcq = window.vmtrcq || [];
  window.vmtrc =
    window.vmtrc ||
    function (...args: QueueItem) {
      window.vmtrcq!.push(args);
    };
}

class Vemetric implements IVemetric {
  init(options: Options): boolean {
    if (document.getElementById('vmtrc-scr') || document.getElementById('vmtrc-scr-js')) {
      return false;
    }

    window.vmtrcOptions = { sdk: 'web', ...options };
    const script = document.createElement('script');
    script.src = options.scriptUrl || 'https://cdn.vemetric.com/main.js';
    script.defer = true;
    script.id = 'vmtrc-scr';

    // TODO: can be removed at a later point:
    script.dataset.token = options.token;
    if (options.host) {
      script.dataset.host = options.host;
    }
    if (typeof options.allowCookies === 'boolean') {
      script.dataset.allowCookies = String(options.allowCookies);
    }
    if (typeof options.trackPageViews === 'boolean') {
      script.dataset.trackPageViews = String(options.trackPageViews);
    }
    if (typeof options.trackOutboundLinks === 'boolean') {
      script.dataset.trackOutboundLinks = String(options.trackOutboundLinks);
    }
    if (typeof options.trackDataAttributes === 'boolean') {
      script.dataset.trackDataAttributes = String(options.trackDataAttributes);
    }
    if (typeof options.maskPaths !== 'undefined') {
      script.dataset.maskPaths = JSON.stringify(options.maskPaths);
    }

    document.getElementsByTagName('head')[0].appendChild(script);

    return true;
  }
  async trackPageView(): Promise<void> {
    await window.vmtrc?.('trackPageView');
  }
  trackPageLeave(): void {
    window.vmtrc?.('trackPageLeave');
  }
  async trackEvent(eventName: string, props: EventProps = {}): Promise<void> {
    await window.vmtrc?.('trackEvent', eventName, props);
  }
  getUserIdentifier() {
    return getUserIdentifier();
  }
  async identify(props: IdentifyProps): Promise<void> {
    await window.vmtrc?.('identify', props);
  }
  async updateUser(data: UpdateUserProps): Promise<void> {
    await window.vmtrc?.('updateUser', data);
  }
  async resetUser(): Promise<void> {
    await window.vmtrc?.('resetUser');
  }
  enableTrackPageViews(): void {
    window.vmtrc?.('enableTrackPageViews');
  }
  enableTrackOutboundLinks(): void {
    window.vmtrc?.('enableTrackOutboundLinks');
  }
  enableTrackDataAttributes(): void {
    window.vmtrc?.('enableTrackDataAttributes');
  }
}

export const vemetric = new Vemetric();
