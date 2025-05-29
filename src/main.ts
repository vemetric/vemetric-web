import { Vemetric, type Options } from './client';
import type { VemetricMethod, QueueItem } from './types';

const vemetric = new Vemetric();

const executeMethod = (methodName: VemetricMethod, ...args: unknown[]) => {
  const method = vemetric[methodName];
  if (typeof method === 'function') {
    // @ts-expect-error - Method binding complexity
    return method.apply(vemetric, args);
  }
};

const scriptElement = document.currentScript as HTMLScriptElement;
const options: Options = window.vmtrcOptions || { token: '' };
if (scriptElement) {
  const token = scriptElement.getAttribute('data-token');
  if (token) {
    options.token = token;
  }

  const host = scriptElement.getAttribute('data-host');
  if (host) {
    options.host = host;
  }

  const allowCookies = scriptElement.getAttribute('data-allow-cookies');
  if (allowCookies) {
    options.allowCookies = allowCookies === 'true';
  }

  const trackPageViews = scriptElement.getAttribute('data-track-page-views');
  if (trackPageViews) {
    options.trackPageViews = trackPageViews !== 'false';
  }
  const trackOutboundLinks = scriptElement.getAttribute('data-track-outbound-links');
  if (trackOutboundLinks) {
    options.trackOutboundLinks = trackOutboundLinks !== 'false';
  }
  const trackDataAttributes = scriptElement.getAttribute('data-track-data-attributes');
  if (trackDataAttributes) {
    options.trackDataAttributes = trackDataAttributes !== 'false';
  }

  const maskPaths = scriptElement.getAttribute('data-mask-paths');
  if (maskPaths) {
    try {
      options.maskPaths = JSON.parse(maskPaths);
    } catch (e) {
      console.warn('Failed to parse mask paths:', e);
    }
  }
}

vemetric.init(options);
window.vmtrc = (...queueItem: QueueItem) => {
  const [methodName, ...args] = queueItem;
  return executeMethod(methodName, ...args);
};

// Process any existing queue items
while (window.vmtrcq && window.vmtrcq.length > 0) {
  const [methodName, ...args] = window.vmtrcq.shift()!;
  executeMethod(methodName, ...args);
}
