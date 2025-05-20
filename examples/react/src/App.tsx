import { vemetric } from '@vemetric/react';
import './App.css';

function App() {
  return (
    <>
      <h1>Vemetric React Example</h1>
      <div className="card">
        <button
          onClick={() => {
            vemetric.trackEvent('custom_event_react');
          }}
        >
          Track Custom Event
        </button>
      </div>
    </>
  );
}

export default App;
