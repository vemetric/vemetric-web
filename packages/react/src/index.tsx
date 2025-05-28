'use client';
import { useEffect } from 'react';
import { type Options, vemetric } from '../../../src/index';

interface Props extends Options {
  onInit?: () => void;
}

function VemetricScript(props: Props): null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initialized = vemetric.init({ ...props, sdk: 'react' });
    if (initialized) {
      props.onInit?.();
    }
  }, []);

  return null;
}

export { vemetric, VemetricScript };
