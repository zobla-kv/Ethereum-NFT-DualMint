import './App.css';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <div>test</div>
      </MainLayout>
    </AuthProvider>
  );
}

export default App;
