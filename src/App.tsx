import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import { useShortcuts } from './utils/ShortcutManager';
import './styles/App.scss';

const AppContent: React.FC = () => {
  useShortcuts([
    { key: 'z', ctrlKey: true, action: () => console.log('Undo') },
    { key: 'z', ctrlKey: true, shiftKey: true, action: () => console.log('Redo') },
    { key: ' ', action: () => console.log('Play/Pause') },
  ]);

  return <Layout />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;