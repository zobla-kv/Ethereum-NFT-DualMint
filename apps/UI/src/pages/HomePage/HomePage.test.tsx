import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import HomePage from './HomePage';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockSwitchChainAsync = vi.fn();
vi.mock('wagmi', () => ({
  useSwitchChain: () => ({
    chains: [
      { id: 1, name: 'ChainA' },
      { id: 2, name: 'ChainB' },
    ],
    switchChainAsync: mockSwitchChainAsync,
  }),
}));

vi.mock('../../layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'connected', chainId: 1 },
    });
  });

  it('renders title and chain buttons', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Mint Your/i)).toBeInTheDocument();
    expect(screen.getByText('ChainA')).toBeInTheDocument();
    expect(screen.getByText('ChainB')).toBeInTheDocument();
  });

  it('alerts if user is not connected', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'disconnected' },
    });

    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainA'));
    expect(window.alert).toHaveBeenCalledWith(
      'You must connect a wallet first.'
    );
  });

  it('navigates if user chain matches button chain', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainA'));
  });

  it('calls switchChainAsync and navigates on success', async () => {
    mockSwitchChainAsync.mockResolvedValue({ id: 2, name: 'ChainB' });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainB'));
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 2 });

    await waitFor(() => {});
  });

  it('alerts on switchChainAsync failure', async () => {
    mockSwitchChainAsync.mockRejectedValue(new Error('fail'));
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainB'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('error connecting to: ChainB');
    });
  });
});
