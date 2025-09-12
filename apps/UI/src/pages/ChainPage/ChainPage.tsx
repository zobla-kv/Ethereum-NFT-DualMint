import photoLibraryIcon from '../../assets/photo_icon.svg';

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';

import { produce } from 'immer';

import type { NFT } from '@nft/types/NFT';

import {
  type NFTDraftResponse,
  type ApiErrorResponse,
} from '@nft/types/ApiResponse';

import { useAuth } from '../../context/AuthContext';

import MainLayout from '../../layout/MainLayout';
import AsyncButton from '../../components/ui/AsyncButton/AsyncButton';

import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useContract } from '../../hooks/useContract';
import config from '../../../wagmi.config';

type FormStatus = 'idle' | 'submitting' | 'invalid' | 'blocked';

interface Form<T> {
  data: Partial<T>;
  status: FormStatus;
  error: string | null;
}

interface PromptForm {
  prompt: string;
}

interface NFTDraftForm {
  address: `0x${string}`;
  nft: NFT;
  response: `0x${string}` | null;
}

// TODO: 404 if non existing chain
// TODO: fix bug. Alert shows when: Enter nft prompt -> submit the form -> reload the page
// TODO: allow user to update name and description
// TODO: switch chain on url change
const ChainPage = (): ReactElement => {
  const { user } = useAuth();
  const contract = useContract();
  const { writeContractAsync } = useWriteContract();

  const [promptForm, setPromptForm] = useState<Form<PromptForm>>({
    data: {},
    status: 'idle',
    error: null,
  });

  const [nftDraftForm, setNftDraftForm] = useState<Form<NFTDraftForm>>({
    data: {},
    status: 'idle',
    error: null,
  });

  const handlePromptChange = (ev: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = ev.target.value;

    setPromptForm(
      produce(promptForm, (form) => {
        form.data.prompt = value;

        if (form.status !== 'submitting' && form.status !== 'blocked') {
          form.status = 'idle';
          form.error = null;
        }
      })
    );
  };

  // prettier-ignore
  const handleGenerateNFTDraft = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();

    const prompt = promptForm.data.prompt || '';

    if (!isPromptValid(prompt)) {
      setPromptForm(
        produce(promptForm, (form) => {
          form.error =
            'Prompt can only contain letters, numbers, commas, and periods';
        })
      );
      return;
    }

    setPromptForm(
      produce(promptForm, (form) => {
        form.status = 'submitting';
      })
    );
    setNftDraftForm(
      produce(nftDraftForm, (form) => {
        form.error = null;
        form.data.response = null;
      })
    );

    fetch('http://localhost:4600/api/nft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
      .then(async (res: Response) => {
        const data: NFTDraftResponse = await res.json();

        if (!res.ok) {
          const error = data as ApiErrorResponse;

          const updatePromptForm = (status: FormStatus) => {
            setPromptForm(
              produce(promptForm, (form) => {
                form.status = status;
                form.error = error.message;
              })
            );
          };

          switch (error.status) {
            case 400:
              updatePromptForm('idle');
              return;

            case 429:
              // TODO: show message and count immediately?
              updatePromptForm('blocked');
              return;

            default:
              throw new Error();
          }
        }

        const nftDraft = data as NFT;

        setNftDraftForm(
          produce(nftDraftForm, (form) => {
            form.data.nft = nftDraft;
          })
        );
        return nftDraft;
      })
      .catch((err) => {
        // TODO: add toast
        alert('Something went wrong. Please try again.');
      })
      .finally(() => {
        setPromptForm(
          produce(promptForm, (form) => {
            form.status = 'idle';
          })
        );
      });
  };

  const isPromptValid = (prompt: string): boolean => {
    const regex = /^[a-zA-Z0-9 ,.\n]{1,200}$/;
    return regex.test(prompt) ? true : false;
  };

  // prettier-ignore
  const handleMintNFT = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();

    setNftDraftForm((prevData) =>
      produce(prevData, (form) => {
        form.status = 'submitting';
        form.error = null;
        form.data.response = null;
      })
    );

    const uploadMetadata = async (): Promise<string> => {
      try {
        const response = await fetch('http://localhost:4600/api/nft/pinata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nftDraft: nftDraftForm.data.nft }),
        });

        if (!response.ok) {
          throw new Error();
        }

        return await response.json();
      } catch (err: unknown) {
        throw new Error('Something went wrong. Please try again.');
      }
    };

    const mintOnChain = async (metadataUri: string): Promise<`0x${string}`> => {
      try {
        const txHash = await writeContractAsync({
          address: contract.address,
          abi: contract.abi,
          functionName: contract.mintFn,
          args: [metadataUri],
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        return receipt.transactionHash;
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message.split('\n')[0]);
        }
        throw new Error('Something went wrong. Please try again.');
      }
    };

    try {
      const metadataUri = await uploadMetadata();
      const txHash = await mintOnChain(metadataUri);

      setNftDraftForm((prevData) =>
        produce(prevData, (form) => {
          form.data.response = txHash;
        })
      );
    } catch (err: unknown) {
      setNftDraftForm((prevData) =>
        produce(prevData, (form) => {
          form.error = formatError(err);
        })
      );
    } finally {
      setNftDraftForm((prevData) =>
        produce(prevData, (form) => {
          form.status = 'idle';
        })
      );
    }
  };

  const formatError = (err: unknown): string => {
    if (typeof err === 'string') {
      return err;
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return 'Something went wrong. Please try again.';
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between">
        <div>
          <div className="h-[150px] px-4">
            <h2 className="text-center mt-5">
              Chain:{' '}
              <span className="text-[var(--color-accent)]">
                {user?.chain?.name}
              </span>
            </h2>
            {user?.chain?.testnet ? (
              <p className="text-green-500 text-center mt-0 mb-5">
                You are on testnet. Minting is free.
              </p>
            ) : (
              <p className="text-red-500 text-center mt-0 mb-5">
                ⚠️ You are on MAINNET. Minting an NFT will have real gas fees.
              </p>
            )}
          </div>
          <form
            onSubmit={(e) => handleGenerateNFTDraft(e)}
            className="w-[400px] mt-5"
          >
            <h2>Generate NFT draft</h2>
            <label htmlFor="prompt" className="sr-only">
              Prompt
            </label>
            <div className="w-full">
              <textarea
                id="prompt"
                name="prompt"
                className="resize-none"
                rows={4}
                placeholder="Describe your image"
                value={promptForm.data.prompt}
                onChange={(e) => handlePromptChange(e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form) {
                      form.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                      );
                    }
                  }
                }}
              />
              {promptForm.error && (
                <span className="error">{promptForm.error}</span>
              )}
              {/* always render to prevent layout shift */}
              {/* <span className='error'>{formData.error}</span> */}
            </div>
            <AsyncButton
              text="Generate"
              type="submit"
              disabled={
                promptForm.status === 'invalid' ||
                promptForm.status === 'blocked' ||
                nftDraftForm.status === 'submitting'
              }
              isLoading={promptForm.status === 'submitting'}
            />
          </form>
        </div>

        <form
          onSubmit={(e) => handleMintNFT(e)}
          className="w-[820px] min-h-[400px]"
        >
          <h2>Preview NFT</h2>
          <fieldset>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              value={user?.address}
              readOnly
              className="focus:outline-none"
            />

            <div className="flex mt-4 gap-5">
              <div className="w-[300px]">
                {nftDraftForm.data.nft?.metadata ? (
                  <img
                    className="border-2 border-[var(--color-accent)] p-2 min-w-[300px] h-[300px] rounded-2xl mb-5"
                    src={nftDraftForm.data.nft?.metadata.image}
                    alt={nftDraftForm.data.nft?.metadata.description}
                  />
                ) : (
                  <div className="relative border-2 border-[var(--color-accent)] min-w-[300px] h-[300px] rounded-lg mb-5 grid place-items-center animate-pulse">
                    <img
                      src={photoLibraryIcon}
                      className="w-[180px] h-[180px]"
                    />
                    <span className="absolute bottom-5">
                      Waiting for draft...
                    </span>
                  </div>
                )}

                <AsyncButton
                  text="Mint NFT"
                  type="submit"
                  disabled={!nftDraftForm.data}
                  isLoading={nftDraftForm.status === 'submitting'}
                  className="block mx-auto"
                />
                <div className="mt-5 text-center">
                  {nftDraftForm.error && (
                    <span className="error">
                      Mint Failed.
                      <br />
                      Reason: {nftDraftForm.error}
                    </span>
                  )}
                  {nftDraftForm.data.response && !nftDraftForm.error && (
                    <span className="success">
                      NFT minted successfully.
                      <br />
                      Transaction hash: {nftDraftForm.data.response}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="col-span-2">
                  <label htmlFor="name">[ Name ]</label>
                  <input
                    id="name"
                    name="name"
                    value={nftDraftForm.data.nft?.metadata.name || ''}
                    placeholder="Waiting for draft..."
                    readOnly
                    className="focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="description">[ Description ]</label>
                  <textarea
                    id="description"
                    name="description"
                    value={nftDraftForm.data.nft?.metadata.description || ''}
                    placeholder="Waiting for draft..."
                    readOnly
                    className="resize-none focus:outline-none"
                  />
                </div>

                {(
                  nftDraftForm.data.nft?.metadata.attributes ||
                  Array(4).fill({})
                ).map((attr, index) => {
                  return (
                    <div
                      key={attr?.trait_type || index}
                      className="attribute-card"
                    >
                      <label>[ {attr?.trait_type || 'Attribute'} ]</label>
                      <p className="font-sm font-bold">
                        {attr.value || 'Waiting for draft...'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChainPage;
