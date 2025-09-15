import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner/Spinner';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
}));

vi.mock('../ui/Spinner/Spinner', () => ({
  default: () => <div>Spinner</div>,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to / when user is null', () => {
    (useAuth as vi.Mock).mockReturnValue({ user: null });
    render(
      <ProtectedRoute>
        <div>Child</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Navigate to /')).toBeInTheDocument();
  });

  it('redirects to / when user is disconnected', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'disconnected' },
    });
    render(
      <ProtectedRoute>
        <div>Child</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Navigate to /')).toBeInTheDocument();
  });

  it('shows Spinner when connecting', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'connecting' },
    });
    render(
      <ProtectedRoute>
        <Spinner />
      </ProtectedRoute>
    );
    expect(screen.getByText('Spinner')).toBeInTheDocument();
  });

  it('shows "Checking authentication..." when reconnecting', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'reconnecting' },
    });
    render(
      <ProtectedRoute>
        <Spinner />
      </ProtectedRoute>
    );
    expect(screen.getByText('Spinner')).toBeInTheDocument();
  });

  it('renders children when user is connected', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'connected' },
    });
    render(
      <ProtectedRoute>
        <div>Child Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
