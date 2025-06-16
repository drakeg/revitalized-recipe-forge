
import React, { useState } from "react";
import PremiumFeatureGate from "./PremiumFeatureGate";

interface PremiumModalProps {
  featureName: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  featureName,
  description,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <PremiumFeatureGate
      featureName={featureName}
      description={description}
      isModal={true}
      onClose={onClose}
    />
  );
};

export default PremiumModal;
