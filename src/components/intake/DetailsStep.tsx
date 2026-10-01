"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { PillButton } from "../ui/PillButton";
import type { ProductType } from "@/lib/products";
import { CALENDLY_URL } from "@/lib/site-config";

export type DetailsData = {
  name: string;
  email: string;
  company: string;
  brandFile: File | null;
  brandFileUrl: string | null;
  currentProductFile: File | null;
  currentProductFileUrl: string | null;
  currentProductLink: string;
  dielineFile: File | null;
  dielineFileUrl: string | null;
  links: string[];
  notes: string;
};

type UploadState = "idle" | "uploading" | "done" | "error";

export function DetailsStep({
  product,
  initial,
  onContinue,
  onDirtyChange,
}: {
  product: ProductType | null;
  initial: DetailsData;
  onContinue: (data: DetailsData) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const isPackage = product === "package";
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [company, setCompany] = useState(initial.company);
  const [brandFile, setBrandFile] = useState<File | null>(initial.brandFile);
  const [brandFileUrl, setBrandFileUrl] = useState<string | null>(
    initial.brandFileUrl
  );
  const [brandUploadState, setBrandUploadState] = useState<UploadState>(
    initial.brandFileUrl ? "done" : "idle"
  );
  const [currentProductFile, setCurrentProductFile] = useState<File | null>(
    initial.currentProductFile
  );
  const [currentProductFileUrl, setCurrentProductFileUrl] = useState<
    string | null
  >(initial.currentProductFileUrl);
  const [currentProductUploadState, setCurrentProductUploadState] =
    useState<UploadState>(initial.currentProductFileUrl ? "done" : "idle");
  const [currentProductLink, setCurrentProductLink] = useState(
    initial.currentProductLink
  );
  const [dielineFile, setDielineFile] = useState<File | null>(initial.dielineFile);
  const [dielineFileUrl, setDielineFileUrl] = useState<string | null>(
    initial.dielineFileUrl
  );
  const [dielineUploadState, setDielineUploadState] = useState<UploadState>(
    initial.dielineFileUrl ? "done" : "idle"
  );
  const [isDraggingDieline, setIsDraggingDieline] = useState(false);
  const dielineInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<string[]>(
    initial.links.length ? initial.links : [""]
  );
  const [notes, setNotes] = useState(initial.notes);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingCurrent, setIsDraggingCurrent] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentProductInputRef = useRef<HTMLInputElement>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const missingContact = !name.trim() || !emailValid;
  const missingBrief =
    !notes.trim() &&
    !links.some((l) => l.trim()) &&
    !brandFile &&
    !currentProductFile &&
    !currentProductLink.trim();

  useEffect(() => {
    onDirtyChange?.(
      Boolean(
        name ||
          email ||
          company ||
          brandFile ||
          currentProductFile ||
          currentProductLink ||
          dielineFile ||
          links.some((l) => l) ||
          notes
      )
    );
  }, [
    name,
    email,
    company,
    brandFile,
    currentProductFile,
    currentProductLink,
    dielineFile,
    links,
    notes,
    onDirtyChange,
  ]);

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

  const addLink = () => setLinks((prev) => [...prev, ""]);

  const removeLink = (index: number) =>
    setLinks((prev) => prev.filter((_, i) => i !== index));

  const uploadTokenRef = useRef<string | null>(null);
  const getUploadToken = async () => {
    if (uploadTokenRef.current) return uploadTokenRef.current;
    const res = await fetch("/api/upload/token", { method: "POST" });
    if (!res.ok) throw new Error("Failed to start upload session");
    const data = (await res.json()) as { token: string };
    uploadTokenRef.current = data.token;
    return data.token;
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBrandFile(file);
    setBrandFileUrl(null);
    setBrandUploadState("uploading");
    getUploadToken()
      .then((token) =>
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: token,
        })
      )
      .then((blob) => {
        setBrandFileUrl(blob.url);
        setBrandUploadState("done");
      })
      .catch(() => setBrandUploadState("error"));
  };

  const handleCurrentProductFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setCurrentProductFile(file);
    setCurrentProductFileUrl(null);
    setCurrentProductUploadState("uploading");
    getUploadToken()
      .then((token) =>
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: token,
        })
      )
      .then((blob) => {
        setCurrentProductFileUrl(blob.url);
        setCurrentProductUploadState("done");
      })
      .catch(() => setCurrentProductUploadState("error"));
  };

  const handleDielineFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setDielineFile(file);
    setDielineFileUrl(null);
    setDielineUploadState("uploading");
    getUploadToken()
      .then((token) =>
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: token,
        })
      )
      .then((blob) => {
        setDielineFileUrl(blob.url);
        setDielineUploadState("done");
      })
      .catch(() => setDielineUploadState("error"));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 pb-40 sm:px-10">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Show us your vibe.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-paper/60">
          Submit your branding, drop a few inspiration links / brands you
          love, and tell us about your product. We&apos;ll take it from
          there.
        </p>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-mono text-xs tracking-[0.1em] text-coral uppercase hover:underline"
        >
          Prefer to talk it through? Book a call →
        </a>
      </div>

      <div className="mt-12">
        <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
          Your Info
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-transparent text-base outline-none placeholder:text-paper/40"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-base outline-none placeholder:text-paper/40"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Business / company"
              className="w-full bg-transparent text-base outline-none placeholder:text-paper/40"
            />
          </div>
        </div>
      </div>

      <div className={`mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 ${isPackage ? "lg:grid-cols-4" : ""}`}>
        <div>
          <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Brand Guidelines
          </p>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex h-[275px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[30px] border border-panel-stroke bg-dark-950 p-4 text-center transition-colors ${
              isDragging ? "bg-dark-800" : ""
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="text-balance text-lg font-semibold">
              {brandFile ? brandFile.name : "Drop your brand file here"}
            </p>
            {brandUploadState === "uploading" && (
              <p className="font-mono text-xs tracking-[0.1em] text-dark-400 uppercase">
                Uploading…
              </p>
            )}
            {brandUploadState === "error" && (
              <p className="font-mono text-xs tracking-[0.1em] text-coral uppercase">
                Upload failed — try again
              </p>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-dark-600 px-6 py-2.5 font-mono text-xs tracking-[0.15em] uppercase hover:border-paper"
            >
              Browse files
            </button>
          </label>
        </div>

        <div>
          <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            {isPackage ? "Existing Packaging" : "Current Product"}
          </p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingCurrent(true);
            }}
            onDragLeave={() => setIsDraggingCurrent(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCurrent(false);
              handleCurrentProductFiles(e.dataTransfer.files);
            }}
            className={`flex h-[275px] flex-col items-center justify-center gap-3 rounded-[30px] border border-panel-stroke bg-dark-950 p-4 text-center transition-colors ${
              isDraggingCurrent ? "bg-dark-800" : ""
            }`}
          >
            <input
              ref={currentProductInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleCurrentProductFiles(e.target.files)}
            />
            <p className="text-balance text-lg font-semibold">
              {currentProductFile
                ? currentProductFile.name
                : isPackage
                  ? "Have an existing label or packaging?"
                  : "Have an existing site, app, or deck?"}
            </p>
            {currentProductUploadState === "uploading" && (
              <p className="font-mono text-xs tracking-[0.1em] text-dark-400 uppercase">
                Uploading…
              </p>
            )}
            {currentProductUploadState === "error" && (
              <p className="font-mono text-xs tracking-[0.1em] text-coral uppercase">
                Upload failed — try again
              </p>
            )}
            <button
              type="button"
              onClick={() => currentProductInputRef.current?.click()}
              className="rounded-full border border-dark-600 px-6 py-2.5 font-mono text-xs tracking-[0.15em] uppercase hover:border-paper"
            >
              Browse files
            </button>
            <div className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-panel-stroke bg-dark-900 px-5 py-3 text-left transition-colors focus-within:border-coral">
              <input
                value={currentProductLink}
                onChange={(e) => setCurrentProductLink(e.target.value)}
                placeholder="...or paste a link to it"
                className="w-full bg-transparent text-sm outline-none placeholder:text-paper/40"
              />
            </div>
          </div>
        </div>

        {isPackage && (
          <div>
            <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Dielines
            </p>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingDieline(true);
              }}
              onDragLeave={() => setIsDraggingDieline(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingDieline(false);
                handleDielineFiles(e.dataTransfer.files);
              }}
              className={`flex h-[275px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[30px] border border-panel-stroke bg-dark-950 p-4 text-center transition-colors ${
                isDraggingDieline ? "bg-dark-800" : ""
              }`}
            >
              <input
                ref={dielineInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleDielineFiles(e.target.files)}
              />
              <p className="text-balance text-lg font-semibold">
                {dielineFile ? dielineFile.name : "Have a dieline template?"}
              </p>
              <p className="text-pretty text-xs text-paper/40">
                From your printer or manufacturer, if you have one
              </p>
              {dielineUploadState === "uploading" && (
                <p className="font-mono text-xs tracking-[0.1em] text-dark-400 uppercase">
                  Uploading…
                </p>
              )}
              {dielineUploadState === "error" && (
                <p className="font-mono text-xs tracking-[0.1em] text-coral uppercase">
                  Upload failed — try again
                </p>
              )}
              <button
                type="button"
                onClick={() => dielineInputRef.current?.click()}
                className="rounded-full border border-dark-600 px-6 py-2.5 font-mono text-xs tracking-[0.15em] uppercase hover:border-paper"
              >
                Browse files
              </button>
            </label>
          </div>
        )}

        <div>
          <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Inspiration Links
          </p>
          <div className="flex flex-col gap-3">
            {links.map((link, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                <input
                  value={link}
                  onChange={(e) => updateLink(i, e.target.value)}
                  placeholder="Paste another link..."
                  className="w-full bg-transparent text-base outline-none placeholder:text-paper/40"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label="Remove link"
                    className="shrink-0 text-paper/40 hover:text-coral"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addLink}
            className="mt-3 font-mono text-xs tracking-[0.15em] text-paper uppercase hover:text-coral"
          >
            + Add another link
          </button>
        </div>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-balance font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
          Product Description &amp; Notes
        </p>
        <div className="rounded-[30px] border border-panel-stroke bg-dark-950">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isPackage
                ? "What's the product, and what are the SKU names/flavors? Can, bottle, or box — and what size? Any print vendor or file spec requirements, required nutrition/regulatory panels, and the vibe you're going for."
                : "What are we building, who's it for, and what should it feel like? Tone, must-haves, no-gos — anything that helps us nail it on the first pass."
            }
            className="h-[300px] w-full resize-none rounded-[30px] bg-transparent p-8 text-base outline-none placeholder:text-dark-400 sm:h-[413px]"
          />
        </div>

        <div className="mt-6 flex flex-col items-end gap-2">
          {(brandUploadState === "uploading" ||
            currentProductUploadState === "uploading" ||
            dielineUploadState === "uploading") && (
            <p className="font-mono text-xs tracking-[0.1em] text-dark-400 uppercase">
              Finishing upload…
            </p>
          )}
          {showValidation && (missingContact || missingBrief) && (
            <p className="text-balance text-right text-sm text-coral">
              {missingContact && missingBrief
                ? "Add your name and email, and at least one link, file, or note about your product."
                : missingContact
                  ? "Add your name and email to continue."
                  : "Give us at least one inspiration link, file, or note about your product."}
            </p>
          )}
          <PillButton
            size="xl"
            variant="paper"
            disabled={
              brandUploadState === "uploading" ||
              currentProductUploadState === "uploading" ||
              dielineUploadState === "uploading"
            }
            onClick={() => {
              if (missingContact || missingBrief) {
                setShowValidation(true);
                return;
              }
              onContinue({
                name,
                email,
                company,
                brandFile,
                brandFileUrl,
                currentProductFile,
                currentProductFileUrl,
                currentProductLink,
                dielineFile,
                dielineFileUrl,
                links,
                notes,
              });
            }}
            className="h-14 whitespace-nowrap"
          >
            Continue to payment →
          </PillButton>
        </div>
      </div>
    </div>
  );
}
