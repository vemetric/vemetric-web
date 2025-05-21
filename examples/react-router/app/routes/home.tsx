import { Link } from 'react-router';
import type { Route } from './+types/home';
import { vemetric } from '@vemetric/react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}

export default function Home() {
  return (
    <>
      <Link to="/about">About</Link>
      <h1>React Router Vemetric Example</h1>
      <button
        onClick={() => {
          vemetric.trackEvent('custom_event_react_router');
        }}
      >
        Click me
      </button>
    </>
  );
}
