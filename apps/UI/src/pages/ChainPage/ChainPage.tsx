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
const ChainPage = (): ReactElement => {
  const { user } = useAuth();

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

        setFormStatus('idle');
        return data as NFT;
      })
      .catch((err) => {
        // TODO: add toast
        alert('Something went wrong. Please try again.');
        setFormStatus('idle');
      });
  };

  const isPromptValid = (prompt: string): boolean => {
    const regex = /^[a-zA-Z0-9 ,.]{1,200}$/;
    return regex.test(prompt) ? true : false;
  };

  // TODO: send data to blockchain, handle responses, add return type
  const handleMintNFT = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  return (
    <MainLayout>
      <div>
        <h1 className='text-center mt-5'>
          Generate NFT on {user?.chain?.name}
        </h1>
        <div className='flex'>
          <form onSubmit={(e) => handleGenerateNFTDraft(e)}>
            <h2>Generate image for your NFT</h2>
            <label htmlFor='prompt' className='sr-only'>
              Prompt
            </label>
            <div className='w-full'>
              <textarea
                id='prompt'
                name='prompt'
                rows={4}
                placeholder='Describe your image'
                value={formData.prompt.value}
                onChange={(e) => handleInputChange(e)}
              />
              {formData.prompt.error && (
                <span className='error'>{formData.prompt.error}</span>
              )}
              {/* always render to prevent layout shift */}
              {/* <span className='error'>{formData.prompt.error}</span> */}
            </div>
            <AsyncButton
              text='Generate'
              type='submit'
              disabled={formStatus === 'invalid' || formStatus === 'blocked'}
              isLoading={formStatus === 'submitting'}
            />
          </form>

          <form onSubmit={(e) => handleMintNFT(e)}>
            <h2>Preview NFT</h2>
            <fieldset>
              <label htmlFor='address'>Address</label>
              <input
                id='address'
                name='address'
                value={user?.address}
                disabled
              />

              {/* TODO: image and metadata fields */}
            </fieldset>
            <AsyncButton text='Mint NFT' type='submit' isLoading={false} />
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChainPage;
