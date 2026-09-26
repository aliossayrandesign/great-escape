"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IntakeNav } from "@/components/intake/IntakeNav";
import { TopBar } from "@/components/intake/TopBar";
import { ProductStep, type ProductType } from "@/components/intake/ProductStep";
import { DetailsStep, type DetailsData } from "@/components/intake/DetailsStep";
import { PaymentStep } from "@/components/intake/PaymentStep";
import { ConfirmationStep } from "@/components/intake/ConfirmationStep";

type Step = 1 | 2 | 3 | 4;

const EMPTY_DETAILS: DetailsData = {
  name: "",
  email: "",
  company: "",
  brandFile: null,
  currentProductFile: null,
  currentProductLink: "",
  links: [],
  notes: "",
};
const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck"];

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartPageInner />
    </Suspense>
  );
}

function StartPageInner() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("product");
  const initialProduct = VALID_PRODUCTS.includes(preselected as ProductType)
    ? (preselected as ProductType)
    : null;

  const [step, setStep] = useState<Step>(initialProduct ? 2 : 1);
  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [details, setDetails] = useState<DetailsData>(EMPTY_DETAILS);
  const [detailsDirty, setDetailsDirty] = useState(false);
  const dirty = product !== null || detailsDirty;

  return (
    <main className="min-h-screen">
      {step < 4 && (
        <>
          <IntakeNav dirty={dirty} />
          <TopBar
            step={step}
            onBack={step > 1 ? () => setStep((s) => (s - 1) as Step) : undefined}
          />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <ProductStep
              selected={product}
              onSelect={setProduct}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <DetailsStep
              initial={details}
              onContinue={(data) => {
                setDetails(data);
                setStep(3);
              }}
              onDirtyChange={setDetailsDirty}
            />
          )}
          {step === 3 && product && (
            <PaymentStep product={product} onSubmit={() => setStep(4)} />
          )}
          {step === 4 && <ConfirmationStep />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
