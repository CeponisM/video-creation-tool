import React from 'react';
import Header from './components/Header';
import Canvas from './components/Canvas';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const App: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <div className="app">
      <Header />
      <Canvas />
    </div>
  );
};

export default App;