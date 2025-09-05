import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChainPage from './ChainPage';

import { useAuth } from '../../context/AuthContext';

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
    expect(screen.getByText('Generate NFT draft')).toBeInTheDocument();
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

  it('submits generate NFTDraft form successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        metadata: {
          image: 'http://example.com/fake.png',
          description: 'fake description',
          name: 'Fake NFT',
          attributes: [{ trait_type: 'Color', value: 'Red' }],
        },
      }),
    });

    render(<ChainPage />);

    const textarea = screen.getByPlaceholderText('Describe your image');
    const generateButton = screen.getByText('Generate');

    fireEvent.change(textarea, { target: { value: 'cat on the moon' } });
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

  it('resets state to idle when fetch throws an error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChainPage />);
    const textarea = screen.getByPlaceholderText('Describe your image');
    const generateButton = screen.getByText('Generate');

    fireEvent.change(textarea, { target: { value: 'Valid prompt' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('renders user address in mint form', () => {
    render(<ChainPage />);
    const input = screen.getByLabelText('Address') as HTMLInputElement;
    expect(input.value).toBe('0x123');
    expect(input.disabled).toBe(true);
  });
});
