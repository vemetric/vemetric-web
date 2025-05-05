import { beforeEach, vi } from 'vitest';

// Mock browser environment
const sessionStorageMock = {
  store: {},
  getItem: vi.fn((key) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    sessionStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete sessionStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    sessionStorageMock.store = {};
  }),
};

global.sessionStorage = sessionStorageMock;

global.window = {
  location: {
    href: 'https://example.com/initial/path',
    origin: 'https://example.com',
    host: 'example.com',
  },
  history: {
    pushState: vi.fn(),
  },
  addEventListener: vi.fn(),
  sessionStorage,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

global.document = {
  referrer: '',
  addEventListener: vi.fn(),
  currentScript: null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

global.navigator = {
  sendBeacon: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

global.XMLHttpRequest = vi.fn().mockImplementation(() => {
  const xhr = {
    open: vi.fn(),
    send: vi.fn(() => {
      // Immediately trigger the onload callback to simulate synchronous response
      if (xhr.onload) {
        setTimeout(() => xhr.onload?.call(xhr), 0);
      }
      return Promise.resolve();
    }),
    setRequestHeader: vi.fn(),
    withCredentials: false,
    onload: null,
    onerror: null,
    status: 200,
    statusText: 'OK',
    response: '{}',
  };
  return xhr;
});

// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorageMock.store = {};
  // Set a default context ID for testing
  sessionStorageMock.store['_vmCtx'] = '12345';
});
