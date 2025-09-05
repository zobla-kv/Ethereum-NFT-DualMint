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

type FormStatus = 'idle' | 'submitting' | 'invalid' | 'blocked';

interface FormData {
  prompt: {
    value: string;
    error: string | null;
  };
}

// TODO: 404 if non existing chain
// TODO: fix bug. Alert shows when Enter nft prompt -> submit the form -> reload the page
const ChainPage = (): ReactElement => {
  const { user } = useAuth();

  const [nftDraft, setNftDraft] = useState<NFT | null>(null);
  const [formData, setFormData] = useState<FormData>({
    prompt: {
      value: '',
      error: null,
    },
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');

  const handleInputChange = (ev: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = ev.target.value;

    if (formStatus !== 'submitting' && formStatus !== 'blocked') {
      setFormStatus('idle');
    }

    setFormData((prevData) =>
      produce(prevData, (draft) => {
        draft.prompt.value = value;
        draft.prompt.error =
          formStatus === 'blocked' ? prevData.prompt.error : null;
      })
    );
  };

  // prettier-ignore
  const handleGenerateNFTDraft = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();

    const prompt = formData.prompt.value;

    if (!isPromptValid(prompt)) {
      setFormData(
        produce(formData, (draft) => {
          draft.prompt.error =
            'Prompt can only contain letters, numbers, commas, and periods';
        })
      );
      return;
    }

    setFormStatus('submitting');

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
            setFormData(
              produce(formData, (draft) => {
                draft.prompt.error = error.message;
              })
            );
            setFormStatus(status);
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

        setFormStatus('idle');
        setNftDraft(nftDraft);
        return nftDraft;
      })
      .catch((err) => {
        // TODO: add toast
        alert('Something went wrong. Please try again.');
        setFormStatus('idle');
      });
  };

  const isPromptValid = (prompt: string): boolean => {
    const regex = /^[a-zA-Z0-9 ,.\n]{1,200}$/;
    return regex.test(prompt) ? true : false;
  };

  // TODO: send data to blockchain, handle responses, add return type
  const handleMintNFT = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
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
                value={formData.prompt.value}
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
              {formData.prompt.error && (
                <span className="error">{formData.prompt.error}</span>
              )}
              {/* always render to prevent layout shift */}
              {/* <span className='error'>{formData.prompt.error}</span> */}
            </div>
            <AsyncButton
              text="Generate"
              type="submit"
              disabled={formStatus === 'invalid' || formStatus === 'blocked'}
              isLoading={formStatus === 'submitting'}
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
                disabled
              />

              <div className="flex mt-4 gap-5">
                <div className="text-center min-w-[300px]">
                  {nftDraft ? (
                    <img
                      className="border-3 border-blue-600 p-2 min-w-[300px] h-[300px] rounded mb-5"
                      src={nftDraft.metadata.image}
                      alt={nftDraft.metadata.description}
                    />
                  ) : (
                    <div className="relative border-3 border-gray-300 bg-gray-200 min-w-[300px] h-[300px] rounded mb-5 grid place-items-center">
                      <img
                        src={photoLibraryIcon}
                        className="w-[180px] h-[180px]"
                      />
                      <span className="absolute bottom-5 animate-pulse">
                        Waiting for image...
                      </span>
                    </div>
                  )}

                  <AsyncButton
                    text="Mint NFT"
                    type="submit"
                    disabled={!nftDraft}
                    isLoading={false}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="col-span-2">
                    <label htmlFor="name">[ Name ]</label>
                    <input
                      id="name"
                      name="name"
                      value={nftDraft?.metadata.name || ''}
                      placeholder="Waiting for image..."
                      disabled={!nftDraft}
                      className={!nftDraft ? 'animate-pulse' : ''}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="description">[ Description ]</label>
                    <textarea
                      id="description"
                      name="description"
                      value={nftDraft?.metadata.description || ''}
                      placeholder="Waiting for image..."
                      disabled={!nftDraft}
                      className={!nftDraft ? 'animate-pulse' : ''}
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
                          <p
                            className={`font-sm font-bold ${
                              !nftDraft ? 'animate-pulse' : ''
                            }`}
                          >
                            {attr.value || 'Waiting for image...'}
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
