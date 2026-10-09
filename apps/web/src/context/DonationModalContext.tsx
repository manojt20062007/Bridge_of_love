import React, { createContext, useContext, useState } from 'react';

interface OpenDonationModalOptions {
  campaignId?: string;
  campaignTitle?: string;
  defaultAmount?: number;
}

interface DonationModalContextType {
  isOpen: boolean;
  options: OpenDonationModalOptions;
  openDonationModal: (options?: OpenDonationModalOptions) => void;
  closeDonationModal: () => void;
}

const DonationModalContext = createContext<DonationModalContextType | undefined>(undefined);

export const DonationModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenDonationModalOptions>({});

  const openDonationModal = (opts: OpenDonationModalOptions = {}) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const closeDonationModal = () => {
    setIsOpen(false);
    setOptions({});
  };

  return (
    <DonationModalContext.Provider
      value={{
        isOpen,
        options,
        openDonationModal,
        closeDonationModal,
      }}
    >
      {children}
    </DonationModalContext.Provider>
  );
};

export const useDonationModal = () => {
  const context = useContext(DonationModalContext);
  if (!context) {
    throw new Error('useDonationModal must be used within DonationModalProvider');
  }
  return context;
};
