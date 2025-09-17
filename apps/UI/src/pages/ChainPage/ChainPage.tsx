import nftIcon from '../../assets/nft_icon.svg';

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import { Navigate, useParams } from 'react-router-dom';

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

import { produce } from 'immer';

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

// TODO: allow user to update name and description
const ChainPage = (): ReactElement => {
  const { chainName } = useParams();
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

  if (!chainName || chainName !== user?.chain?.name) {
    return <Navigate to={`/chain/${user?.chain?.name}`} replace />;
  }

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

    const { isValid, error } = validatePrompt(prompt);

    if (!isValid) {
      setPromptForm(
        produce(promptForm, (form) => {
          form.error = error;
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

    fetch(`${import.meta.env.VITE_API_URL}/nfts/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
      .then(async (res: Response) => {
        const data: NFTDraftResponse = await res.json();

        if (!res.ok) {
          const error = data as ApiErrorResponse;

          switch (error.status) {
            case 400:
              setPromptForm(
                produce(promptForm, (form) => {
                  form.status = 'idle';
                  form.error = error.message;
                })
              );
              return;

            case 429:
              // TODO: show message and count immediately?
              setPromptForm(
                produce(promptForm, (form) => {
                  form.status = 'blocked';
                  form.error = error.message;
                })
              );
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
      .catch((err: unknown) => {
        setPromptForm((prevForm) =>
          produce(prevForm, (form) => {
            form.error = 'Failed to generate NFT draft. Please try again.';
          })
        );
      })
      .finally(() => {
        setPromptForm((prevForm) =>
          produce(prevForm, (form) => {
            form.status = 'idle';
          })
        );
      });
  };

  const validatePrompt = (
    prompt: string
  ): { isValid: boolean; error: string | null } => {
    if (!prompt.trim()) {
      return { isValid: false, error: "Prompt can't be empty." };
    }

    const regex = /^[a-zA-Z0-9 ,.\n]{1,200}$/;
    if (!regex.test(prompt)) {
      return {
        isValid: false,
        error: 'Prompt can only contain letters, numbers, commas, and periods',
      };
    }

    return { isValid: true, error: null };
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/nfts/image`, {
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
      <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start">
        <div className="w-full sm:max-w-[400px]">
          <div className="h-[90px] xl:h-[150px] px-4">
            <h1 className="text-xl !mb-2 text-center mt-5">
              Chain:{' '}
              <span className="text-[var(--color-accent)]">
                {user?.chain?.name}
              </span>
            </h1>
            {user?.chain?.testnet ? (
              <p className="text-green-500 text-center text-sm mt-1 mb-5">
                You are on testnet. Minting is free.
              </p>
            ) : (
              <p className="text-red-500 text-center text-sm mt-1 mb-5">
                ⚠️ You are on MAINNET. Minting NFT will have real gas fees.
              </p>
            )}
          </div>
          <form onSubmit={(e) => handleGenerateNFTDraft(e)} className="mt-5">
            <h2 className="text-center">Generate NFT draft</h2>
            <label htmlFor="prompt" className="sr-only">
              Prompt
            </label>
            <div className="w-full">
              <textarea
                id="prompt"
                name="prompt"
                className="resize-none !text-sm sm:!text-base"
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
          className="w-full sm:max-w-[800px] ms-0 xl:ms-7 mt-15 xl:mt-0"
        >
          <h2 className="text-center">Preview NFT</h2>
          <fieldset className="w-full">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={user?.address}
              readOnly
              className="resize-none focus:outline-none h-12 sm:h-7"
            />

            <div className="flex flex-col xl:flex-row mt-6 xl:mt-4 gap-2 xl:gap-5">
              <div className="w-full max-w-[300px] mx-auto">
                {nftDraftForm.data.nft?.metadata ? (
                  <img
                    className="border-2 border-[var(--color-accent)] p-2 aspect-square rounded-2xl mb-5"
                    alt={nftDraftForm.data.nft?.metadata.description}
                  />
                ) : (
                  <div className="relative border-2 border-[var(--color-accent)] aspect-square rounded-lg mb-5 grid place-items-center animate-pulse">
                    <img src={nftIcon} className="w-[250px] h-[250px] -mt-5" />
                    <span className="absolute bottom-5">
                      Waiting for draft...
                    </span>
                  </div>
                )}

                <MintButtonAndResponse
                  form={nftDraftForm}
                  className="hidden xl:block mt-6"
                />
              </div>

              <div className="-mt-3 xl:-mt-0 grid grid-cols-2 gap-4 w-full">
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
                      <br />
                      <span className="text-xs font-bold opacity-60 relative top-0 xl:top-2">
                        {attr.value || 'Waiting for draft...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <MintButtonAndResponse
              form={nftDraftForm}
              className="block xl:hidden mt-10"
            />
          </fieldset>
        </form>
      </div>
    </MainLayout>
  );
};

// TODO: redesign NFTDraft form responsive design and remove this component
const MintButtonAndResponse = ({
  form,
  className = '',
}: {
  form: Form<NFTDraftForm>;
  className?: string;
}): ReactElement => {
  return (
    <div className={className}>
      <AsyncButton
        text="Mint NFT"
        type="submit"
        disabled={!form.data.nft}
        isLoading={form.status === 'submitting'}
        className="block mx-auto"
      />
      <div className="mt-5 text-center">
        {form.error && (
          <span className="error">
            Mint Failed.
            <br />
            Reason: {form.error}
          </span>
        )}
        {form.data.response && !form.error && (
          <span className="success">
            NFT minted successfully.
            <br />
            Transaction hash: {form.data.response}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChainPage;
