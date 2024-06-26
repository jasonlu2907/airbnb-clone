'use client';

import { useMemo, useState } from 'react';
import Modal from './Modal';
import useRentModal from '@/app/hooks/useRentModal';
import Heading from '../Heading';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { categories } from '../navbar/Categories';
import CategoryInput from '../input/CategoryInput';
import CountrySelect from '../input/CountrySelect';
import Counter from '../input/Counter';
import ImageUpload from '../input/ImageUpload';
import Input from '../input/Input';

interface Props {}

enum STEPS {
  CATEGORY,
  LOCATION,
  INFO,
  IMAGES,
  DESCRIPTION,
  PRICE,
}

const RentModal = (props: Props) => {
  const rentModal = useRentModal();
  const router = useRouter();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    // technically Listing schema in prisma
    defaultValues: {
      category: '',
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: '',
      price: 1,
      title: '',
      description: '',
    },
  });

  // watch is a func destructured from useForm
  const category = watch('category');
  const location = watch('location');
  const guestCount = watch('guestCount');
  const roomCount = watch('roomCount');
  const bathroomCount = watch('bathroomCount');
  const imageSrc = watch('imageSrc');

  const Map = useMemo(
    () =>
      dynamic(() => import('../Map'), {
        ssr: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location]
  );

  //setValue is a func destructured from useForm
  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    setIsLoading(true);

    axios
      .post('/api/listings', data)
      .then(() => {
        toast.success('Listing Created!');
        router.refresh();

        /** reset func destructured from useForm, basically reset the form values*/
        reset();
        setStep(STEPS.CATEGORY);
        rentModal.onClose();
      })
      .catch(() => {
        toast.error('Something went wrong within the process.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      // last step in the rent process
      return 'Create';
    }

    return 'Next';
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined; // no back button
    }

    return 'Back';
  }, [step]);

  let bodyContent = (
    <div className='flex flex-col gap-8'>
      <Heading
        title='Which of these best describes your place?'
        subtitle='Pick a category'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto'>
        {categories.map((item) => (
          <div className='col-span-1' key={item.label}>
            <CategoryInput
              onClick={(category) => setCustomValue('category', category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className='flex flex-col gap-8 '>
        <Heading
          title='Where is your place located?'
          subtitle='Help guests find you'
        />
        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue('location', value)}
        />
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading
          title='Share us some details about your place'
          subtitle='What amenities do you have?'
        />
        <Counter
          title='Guests'
          subtitle='Maximum of guests'
          value={guestCount}
          onChange={(value) => setCustomValue('guestCount', value)}
        />
        <hr />
        <Counter
          title='Rooms'
          subtitle='Maximum of rooms'
          value={roomCount}
          onChange={(value) => setCustomValue('roomCount', value)}
        />
        <hr />
        <Counter
          title='Bathrooms'
          subtitle='Maximum of bathrooms'
          value={bathroomCount}
          onChange={(value) => setCustomValue('bathroomCount', value)}
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading
          title='Add a photo of your place'
          subtitle='Show what your place looks like'
        />

        <ImageUpload
          onChange={(value) => setCustomValue('imageSrc', value)}
          value={imageSrc}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading
          title='How would you describe your place?'
          subtitle='Precisely describe it in a few sentences'
        />
        <Input
          id='title'
          label='Title'
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id='description'
          label='Describe your place'
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading
          title='Set your price'
          subtitle='How much do you want to charge per night'
        />
        <Input
          id='price'
          label='Price'
          formatPrice={true}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <div>
      <Modal
        isOpen={rentModal.isOpen}
        onClose={rentModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        title='Airbnb your home'
        actionLabel={actionLabel}
        secondaryActionLabel={secondaryActionLabel}
        secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
        body={bodyContent}
      />
    </div>
  );
};

export default RentModal;
