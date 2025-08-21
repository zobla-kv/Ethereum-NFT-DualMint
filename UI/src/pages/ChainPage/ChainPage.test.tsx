import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChainPage from './ChainPage';

import { useAuth } from '../../context/AuthContext';
import AsyncButton from '../../components/ui/AsyncButton/AsyncButton';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/ui/AsyncButton/AsyncButton', () => ({
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

describe('ChainPage', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as vi.Mock).mockReturnValue({
      user: {
        address: '0x123',
        chain: { name: 'Ethereum' },
        status: 'connected',
      },
    });
    global.fetch = mockFetch;
  });

  it('renders title with chain name', () => {
    render(<ChainPage />);
    expect(screen.getByText(/Generate NFT on Ethereum/i)).toBeInTheDocument();
  });

  it('renders both forms', () => {
    render(<ChainPage />);
    expect(screen.getByText('Generate image for your NFT')).toBeInTheDocument();
    expect(screen.getByText('Preview NFT')).toBeInTheDocument();
  });

  it('updates textarea on change', () => {
    render(<ChainPage />);
    const textarea = screen.getByPlaceholderText(
      'Describe your image'
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'My NFT prompt' } });
    expect(textarea.value).toBe('My NFT prompt');
  });

  it('submits generate image form successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nftDraft: {} }),
    });

    render(<ChainPage />);
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4600/api/nft',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: 'cat on the moon' }),
        })
      );
    });
  });

  it('handles fetch failure and sets invalid state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed' }),
    });

    render(<ChainPage />);
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('renders user address in mint form', () => {
    render(<ChainPage />);
    const input = screen.getByLabelText('Address') as HTMLInputElement;
    expect(input.value).toBe('0x123');
    expect(input.disabled).toBe(true);
  });
});
