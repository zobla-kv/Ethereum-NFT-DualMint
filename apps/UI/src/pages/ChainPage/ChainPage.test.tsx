import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { useParams } from 'react-router-dom';
import ChainPage from './ChainPage';
import { useAuth } from '../../context/AuthContext';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import type { NFT } from '@nft/types/NFT';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useWriteContract: vi.fn(() => ({
      writeContractAsync: vi.fn(),
    })),
  };
});

vi.mock('wagmi/actions', () => ({
  waitForTransactionReceipt: vi.fn(),
}));

vi.mock('../../hooks/useContract', () => ({
  useContract: () => ({
    address: '0xContract',
    abi: [],
    mintFn: 'mint',
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => {
  return {
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
    Navigate: ({ to }: { to: string }) => <div>Redirected to {to}</div>,
  };
});

vi.mock('../../components/ui/AsyncButton/AsyncButton', () => ({
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

describe('ChainPage', () => {
  const mockFetch = vi.fn();
  const mockWriteContractAsync = vi.fn();
  const mockWaitForTx = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as vi.Mock).mockReturnValue({
      user: {
        address: '0x123',
        chain: { name: 'Ethereum' },
        status: 'connected',
      },
    });

    (useParams as vi.Mock).mockReturnValue({ chainName: 'Ethereum' });

    global.fetch = mockFetch;
    (useWriteContract as vi.Mock).mockReturnValue({
      writeContractAsync: mockWriteContractAsync,
    });
    (waitForTransactionReceipt as vi.Mock) = mockWaitForTx;
  });

  it('redirects to user chain page if chainName is missing', () => {
    (useParams as vi.Mock).mockReturnValue({ chainName: '' });

    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Redirected to /chain/Ethereum')
    ).toBeInTheDocument();
  });

  it('renders chain name in the chain section', () => {
    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );

    const chainHeading = screen.getByRole('heading', {
      level: 1,
      name: /Chain:\s*Ethereum/i,
    });

    expect(chainHeading).toBeInTheDocument();
  });

  it('renders both forms', () => {
    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Generate NFT draft')).toBeInTheDocument();
    expect(screen.getByText('Preview NFT')).toBeInTheDocument();
  });

  it('updates textarea on change', () => {
    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );
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

    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText('Describe your image');
    const generateButton = screen.getByText('Generate');

    fireEvent.change(textarea, { target: { value: 'cat on the moon' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4600/api/nft',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'cat on the moon' }),
        })
      );
    });
  });

  it('resets state to idle when fetch throws an error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText('Describe your image');
    const generateButton = screen.getByText('Generate');

    fireEvent.change(textarea, { target: { value: 'Valid prompt' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('renders user address in mint form', () => {
    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );
    const input = screen.getByLabelText('Address') as HTMLInputElement;
    expect(input.value).toBe('0x123');
    expect(input.readOnly).toBe(true);
  });

  it('uploads metadata and mints NFT successfully', async () => {
    const fakeNFT: NFT = {
      metadata: {
        image: 'http://example.com/fake.png',
        name: 'Fake NFT',
        description: 'Fake Description',
        attributes: [{ trait_type: 'Color', value: 'Red' }],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeNFT,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => 'ipfs://fakeMetadataUri',
    });

    mockWriteContractAsync.mockResolvedValueOnce('0xFAKEHASH');
    mockWaitForTx.mockResolvedValueOnce({ transactionHash: '0xFAKEHASH' });

    render(
      <MemoryRouter>
        <ChainPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Describe your image/i), {
      target: { value: 'A red NFT' },
    });

    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() =>
      expect(screen.getByDisplayValue(/Fake NFT/)).toBeInTheDocument()
    );

    const mintButtons = screen.getAllByText('Mint NFT');
    expect(mintButtons).toHaveLength(2);
    fireEvent.click(mintButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4600/api/nft/pinata',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nftDraft: fakeNFT }),
        })
      );

      expect(mockWriteContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ['ipfs://fakeMetadataUri'],
        })
      );
      expect(mockWaitForTx).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getAllByText(/NFT minted successfully/i)[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText(/0xFAKEHASH/i)[0]).toBeInTheDocument();
    });
  });
});
