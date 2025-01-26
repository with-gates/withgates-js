import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { KnobGuard, useKnob } from '@withgates/react-web';
import { gates } from './main';

function App() {
  const [count, setCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const isEnabled = useKnob('feature-flag-1');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await gates.init();
    await gates.signInUser('00000-22222');
    await gates.sync();
    await gates.setUserAttributes({
      custom: {
        email: 'test@test.com',
        name: 'test',
      },
    });

    setIsInitialized(true);
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        {isEnabled ? 'Enabled' : 'disabled'}
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <div className="card">
        <KnobGuard value="feature-flag-2" fallback={<p>Feature is disabled</p>}>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </KnobGuard>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
