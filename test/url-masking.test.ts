import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vemetric, Options } from '../src/index';

describe('URL Masking', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLocation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalLocation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sendRequestMock: any;

  beforeEach(() => {
    originalLocation = { ...window.location };
    mockLocation = window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  const mockUrl = (url: string) => {
    const urlObj = new URL(url);
    window.location = {
      ...mockLocation,
      hostname: urlObj.hostname,
      href: url,
    };
  };

  const initVemetric = (options: Partial<Options>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vemetric as any).isInitialized = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vemetric as any).lastViewedPage = undefined;
    vemetric.init({
      token: 'test-token',
      ...options,
    });

    // Mock the sendRequest function
    sendRequestMock = vi.fn(() => Promise.resolve({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(vemetric as any, 'sendRequest').mockImplementation(sendRequestMock as any);
  };

  it('should send the original URL when maskPaths is empty', async () => {
    mockUrl('https://example.com/product/123/detail/abc');
    initVemetric({});

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/product/123/detail/abc');
  });

  it('should mask URL when it matches a pattern in maskPaths', async () => {
    mockUrl('https://example.com/product/123/detail/abc');
    initVemetric({
      maskPaths: ['/product/*/detail/*'],
    });

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/product/*/detail/*');
  });

  it('should not mask URL when it does not match any pattern', async () => {
    mockUrl('https://example.com/category/shoes');
    initVemetric({
      maskPaths: ['/product/*/detail/*', '/user/*/profile'],
    });

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/category/shoes');
  });

  it('should mask URL with multiple asterisks', async () => {
    mockUrl('https://example.com/user/123/profile/settings');
    initVemetric({
      maskPaths: ['/user/*/profile/*'],
    });

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/user/*/profile/*');
  });

  it('should apply the first matching pattern when multiple patterns match', async () => {
    mockUrl('https://example.com/product/123/detail/abc');
    initVemetric({
      maskPaths: [
        '/product/*/*/abc', // This also matches but should not be used
        '/product/*/detail/*', // This should match first
      ],
    });

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/product/*/detail/*');
  });

  it('should only apply if same amount of segments match', async () => {
    mockUrl('https://example.com/product/123/detail/abc');
    initVemetric({
      maskPaths: ['/product/*'],
    });

    await vemetric.trackEvent('test-event');
    await vi.waitFor(() => expect(sendRequestMock).toHaveBeenCalled());

    const sentPayload = sendRequestMock.mock.calls[0][1] ?? {};
    expect(sentPayload.url).toBe('https://example.com/product/123/detail/abc');
  });

  it('should handle beacon events with masked URLs', async () => {
    mockUrl('https://example.com/product/789/detail/efg');

    // Mock the Blob constructor
    Blob = vi.fn().mockImplementation((content) => ({
      content: content[0],
      type: content[1],
    }));

    // Mock navigator.sendBeacon
    navigator.sendBeacon = vi.fn();

    initVemetric({
      maskPaths: ['/product/*/detail/*'],
    });

    // Trigger an event with beacon=true
    await vemetric.trackEvent('test-event', { beacon: true });

    expect(navigator.sendBeacon).toHaveBeenCalled();

    // Wait for the navigator.sendBeacon to be called and then check its content
    await vi.waitFor(() => {
      expect(navigator.sendBeacon).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blobArg = (navigator.sendBeacon as any).mock.calls[0][1];
      const blobContent = JSON.parse(blobArg.content);
      expect(blobContent.url).toBe('https://example.com/product/*/detail/*');
    });
  });
});
