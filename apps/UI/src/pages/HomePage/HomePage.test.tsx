import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './HomePage';

import { useAuth } from '../../context/AuthContext';
import { useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useSwitchChain: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}));

describe('HomePage', () => {
  const mockNavigate = vi.fn();
  const mockSwitchChainAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'connected', chainId: 1 },
    });

    (useSwitchChain as vi.Mock).mockReturnValue({
      chains: [
        { id: 1, name: 'ChainA' },
        { id: 2, name: 'ChainB' },
      ],
      switchChainAsync: mockSwitchChainAsync,
    });

    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
  });

  it('renders title and chain buttons', () => {
    render(<HomePage />);

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.getByText('ChainA')).toBeInTheDocument();
    expect(screen.getByText('ChainB')).toBeInTheDocument();
  });

  it('alerts if user is not connected', () => {
    (useAuth as vi.Mock).mockReturnValue({
      user: { status: 'disconnected' },
    });

    window.alert = vi.fn();

    render(<HomePage />);

    fireEvent.click(screen.getByText('ChainA'));

    expect(window.alert).toHaveBeenCalledWith(
      'You must connect a wallet first.'
    );
  });

  it('navigates if user chain matches button chain', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByText('ChainA'));

    expect(mockNavigate).toHaveBeenCalledWith('/chain/ChainA');
  });

  it('calls switchChainAsync and navigates on success', async () => {
    mockSwitchChainAsync.mockResolvedValue({ id: 2, name: 'ChainB' });

    render(<HomePage />);

    fireEvent.click(screen.getByText('ChainB'));

    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 2 });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chain/ChainB');
    });
  });

  it('alerts on switchChainAsync failure', async () => {
    mockSwitchChainAsync.mockRejectedValue(new Error('fail'));

    window.alert = vi.fn();

    render(<HomePage />);

    fireEvent.click(screen.getByText('ChainB'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('error connecting to: ChainB');
    });
  });
});
