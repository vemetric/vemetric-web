type RetryOptions = {
  interval: number;
  maxRetries: number;
  shouldRetry: () => boolean;
  callback: () => void;
};

export function retry({ interval, maxRetries, shouldRetry, callback }: RetryOptions) {
  let retryCount = 0;

  if (!shouldRetry()) {
    callback();
    return;
  }

  const intervalId = setInterval(() => {
    if (shouldRetry()) {
      retryCount++;
      if (retryCount > maxRetries) {
        clearInterval(intervalId);
      }
      return;
    }

    clearInterval(intervalId);
    callback();
  }, interval);
}
