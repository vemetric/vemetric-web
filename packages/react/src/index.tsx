'use client';
import { useEffect } from 'react';
import { Options, vemetric } from '../../../src/index';

function VemetricScript(props: Options): null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    vemetric.init({ ...props, sdk: 'react' });
  }, []);

  return null;
}

export { vemetric, VemetricScript };
