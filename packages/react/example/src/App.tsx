import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { KnobGuard, useKnob } from '@withgates/react-web';
import { gates } from './main';

const NewComponent = ({ text }: { text: string }) => {
  return <p>{text}</p>;
};

const OldComponent = ({ text }: { text: string }) => {
  return <p>{text}</p>;
};

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
        <KnobGuard
          value="user_attributes_management"
          fallback={<OldComponent text="Old Component" />}
        >
          <NewComponent text="New Component" />
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
