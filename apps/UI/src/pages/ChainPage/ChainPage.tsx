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
import { abi } from '../../../../contracts/artifacts/contracts/DualMintNFT.sol/DualMintNFT.json';

type FormStatus = 'idle' | 'submitting' | 'invalid' | 'blocked';

interface FormData {
  prompt: {
    value: string;
    error: string | null;
  };
}

// TODO: 404 if non existing chain
// TODO: fix bug. Alert shows when: Enter nft prompt -> submit the form -> reload the page
// TODO: allow user to update name and description
const ChainPage = (): ReactElement => {
  const { user } = useAuth();
  const { writeContractAsync } = useWriteContract();

  const [nftDraft, setNftDraft] = useState<NFT | null>(null);
  const [promptFormData, setPromptFormData] = useState<FormData>({
    prompt: {
      value: '',
      error: null,
    },
  });
  const [promptFormStatus, setPromptFormStatus] = useState<FormStatus>('idle');
  const [nftDraftFormStatus, setNftDraftFormStatus] =
    useState<FormStatus>('idle');

  const handleInputChange = (ev: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = ev.target.value;

    if (promptFormStatus !== 'submitting' && promptFormStatus !== 'blocked') {
      setPromptFormStatus('idle');
    }

    setPromptFormData((prevData) =>
      produce(prevData, (draft) => {
        draft.prompt.value = value;
        draft.prompt.error =
          promptFormStatus === 'blocked' ? prevData.prompt.error : null;
      })
    );
  };

  // prettier-ignore
  const handleGenerateNFTDraft = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();

    const prompt = promptFormData.prompt.value;

    if (!isPromptValid(prompt)) {
      setPromptFormData(
        produce(promptFormData, (draft) => {
          draft.prompt.error =
            'Prompt can only contain letters, numbers, commas, and periods';
        })
      );
      return;
    }

    setPromptFormStatus('submitting');

    await fetch('http://localhost:4600/api/nft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
      .then(async (res: Response) => {
        const data: NFTDraftResponse = await res.json();

        if (!res.ok) {
          const error = data as ApiErrorResponse;

          const updateForm = (status: FormStatus) => {
            setPromptFormData(
              produce(promptFormData, (draft) => {
                draft.prompt.error = error.message;
              })
            );
            setPromptFormStatus(status);
          };

          switch (error.status) {
            case 400:
              updateForm('idle');
              return;

            case 429:
              // TODO: show message and count immediately?
              updateForm('blocked');
              return;

            default:
              throw new Error();
          }
        }

        const nftDraft = data as NFT;

        setPromptFormStatus('idle');
        setNftDraft(nftDraft);
        return nftDraft;
      })
      .catch((err) => {
        // TODO: add toast
        alert('Something went wrong. Please try again.');
        setPromptFormStatus('idle');
      });
  };

  const isPromptValid = (prompt: string): boolean => {
    const regex = /^[a-zA-Z0-9 ,.\n]{1,200}$/;
    return regex.test(prompt) ? true : false;
  };

  // TODO: send data to blockchain, handle responses, add tests
  // prettier-ignore
  const handleMintNFT = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();

    setNftDraftFormStatus('submitting');

    try {
      const response = await fetch('http://localhost:4600/api/nft/pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftDraft }),
      });

      const metadataUri = await response.json();

      await writeContractAsync({
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        abi,
        functionName: 'mint',
        args: [metadataUri],
      });

      setNftDraftFormStatus('idle');
    } catch (err) {
      // TODO: Add toast
      alert('Mint failed: ' + err);
      setNftDraftFormStatus('idle');
    }
  };

  return (
    <MainLayout>
      <div>
        <h1 className="text-center mt-5">
          Generate NFT on {user?.chain?.name}
        </h1>
        <div className="flex">
          <form
            onSubmit={(e) => handleGenerateNFTDraft(e)}
            className="w-[400px]"
          >
            <h2>Generate NFT draft</h2>
            <label htmlFor="prompt" className="sr-only">
              Prompt
            </label>
            <div className="w-full">
              <textarea
                id="prompt"
                name="prompt"
                rows={4}
                placeholder="Describe your image"
                value={promptFormData.prompt.value}
                onChange={(e) => handleInputChange(e)}
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
              {promptFormData.prompt.error && (
                <span className="error">{promptFormData.prompt.error}</span>
              )}
              {/* always render to prevent layout shift */}
              {/* <span className='error'>{formData.prompt.error}</span> */}
            </div>
            <AsyncButton
              text="Generate"
              type="submit"
              disabled={
                promptFormStatus === 'invalid' || promptFormStatus === 'blocked'
              }
              isLoading={promptFormStatus === 'submitting'}
            />
          </form>

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
                <div className="text-center min-w-[300px]">
                  {nftDraft ? (
                    <img
                      className="border-2 border-[var(--color-accent)] p-2 min-w-[300px] h-[300px] rounded-2xl mb-5"
                      src={nftDraft.metadata.image}
                      alt={nftDraft.metadata.description}
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
                    disabled={!nftDraft}
                    isLoading={nftDraftFormStatus === 'submitting'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="col-span-2">
                    <label htmlFor="name">[ Name ]</label>
                    <input
                      id="name"
                      name="name"
                      value={nftDraft?.metadata.name || ''}
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
                      value={nftDraft?.metadata.description || ''}
                      placeholder="Waiting for draft..."
                      readOnly
                      className="resize-none focus:outline-none"
                    />
                  </div>

                  {(nftDraft?.metadata.attributes || Array(5).fill({})).map(
                    (attr, index) => {
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
                    }
                  )}
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChainPage;
