import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import HomePage from './HomePage';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

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
    (useAuth as Mock).mockReturnValue({
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

  it("show error toast with 'You must connect a wallet first.' if user is not connected to Metamask", () => {
    (useAuth as Mock).mockReturnValue({
      user: { status: 'disconnected' },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainA'));
    expect(toast.error).toHaveBeenCalledWith(
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

  it('shows error toast on switch chain failure', async () => {
    mockSwitchChainAsync.mockRejectedValue(new Error('fail'));
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ChainB'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error connecting to: ChainB');
    });
  });
});
