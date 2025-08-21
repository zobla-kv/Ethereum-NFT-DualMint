import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';

import { produce } from 'immer';

import { useAuth } from '../context/AuthContext';

import MainLayout from '../layout/MainLayout';

import AsyncButton from '../components/ui/AsyncButton/AsyncButton';

type FormStatus = 'idle' | 'submitting' | 'invalid';

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
    setFormStatus('idle');

    const field = ev.target.name;
    const value = ev.target.value;

    const newFormData = produce(formData, (draft) => {
      draft[field as keyof FormData].error = null;
      draft[field as keyof FormData].value = value;
    });

    setFormData(newFormData);
  };

  // TODO: add validation either here or on input change
  // TODO: send data to server, handle responses, add return type
  const handleGenerateImage = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setFormStatus('submitting');

    await fetch('http://localhost:4600/api/nft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'cat 123 on the moon' }),
    })
      .then(async (res) => {
        // TODO: add res and err types
        if (!res.ok) {
          const errorBody = await res.json();
          throw new Error(errorBody?.error || 'Something went wrong');
        }

        const responseJson = await res.json();
        setFormStatus('idle');
      })
      .catch((err) => {
        setFormStatus('invalid');
      });
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
          <form onSubmit={(e) => handleGenerateImage(e)}>
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
              {/* always render to prevent layout shift */}
              <span className='error'>{formData.prompt.error}</span>
            </div>
            <AsyncButton
              text='Generate'
              type='submit'
              disabled={formStatus === 'invalid'}
              isLoading={formStatus === 'submitting'}
            />
          </form>

          <form onSubmit={(e) => handleMintNFT(e)}>
            <h2>Preview NFT</h2>
            <fieldset>
              <legend className='sr-only'>Preview NFT</legend>

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
