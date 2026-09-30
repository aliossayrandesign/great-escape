"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IntakeNav } from "@/components/intake/IntakeNav";
import { TopBar } from "@/components/intake/TopBar";
import { ProductStep, type ProductType } from "@/components/intake/ProductStep";
import {
  PlatformStep,
  type Platform,
  type SiteType,
} from "@/components/intake/PlatformStep";
import { DetailsStep, type DetailsData } from "@/components/intake/DetailsStep";
import { PaymentStep } from "@/components/intake/PaymentStep";
import { ConfirmationStep } from "@/components/intake/ConfirmationStep";

type StepName = "product" | "platform" | "details" | "payment" | "confirmation";

const STEP_LABELS: Record<StepName, string> = {
  product: "PRODUCT",
  platform: "PLATFORM",
  details: "DETAILS",
  payment: "PAYMENT",
  confirmation: "",
};

const EMPTY_DETAILS: DetailsData = {
  name: "",
  email: "",
  company: "",
  brandFile: null,
  brandFileUrl: null,
  currentProductFile: null,
  currentProductFileUrl: null,
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

  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [details, setDetails] = useState<DetailsData>(EMPTY_DETAILS);
  const [detailsDirty, setDetailsDirty] = useState(false);
  const dirty = product !== null || detailsDirty;

  const [stepName, setStepName] = useState<StepName>(
    initialProduct === "website"
      ? "platform"
      : initialProduct
        ? "details"
        : "product"
  );

  const steps: StepName[] =
    product === "website"
      ? ["product", "platform", "details", "payment"]
      : ["product", "details", "payment"];
  const stepIndex = steps.indexOf(stepName);
  const goTo = (name: StepName) => setStepName(name);
  const goBack = () => {
    if (stepIndex > 0) goTo(steps[stepIndex - 1]);
  };

  return (
    <main className="min-h-screen">
      <IntakeNav dirty={dirty} showCancel={stepName !== "confirmation"} />
      {stepName !== "confirmation" && (
        <TopBar
          step={stepIndex + 1}
          totalSteps={steps.length}
          stepLabel={STEP_LABELS[stepName]}
          onBack={stepIndex > 0 ? goBack : undefined}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={stepName}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {stepName === "product" && (
            <ProductStep
              selected={product}
              onSelect={setProduct}
              onContinue={() =>
                goTo(product === "website" ? "platform" : "details")
              }
            />
          )}
          {stepName === "platform" && (
            <PlatformStep
              siteType={siteType}
              platform={platform}
              onSelectSiteType={setSiteType}
              onSelectPlatform={setPlatform}
              onContinue={() => goTo("details")}
            />
          )}
          {stepName === "details" && (
            <DetailsStep
              initial={details}
              onContinue={(data) => {
                setDetails(data);
                goTo("payment");
              }}
              onDirtyChange={setDetailsDirty}
            />
          )}
          {stepName === "payment" && product && (
            <PaymentStep
              product={product}
              siteType={siteType}
              platform={platform}
              details={details}
              onSubmit={() => goTo("confirmation")}
            />
          )}
          {stepName === "confirmation" && <ConfirmationStep />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
