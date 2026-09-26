"use client";

import { useEffect, useRef, useState } from "react";
import { PillButton } from "../ui/PillButton";

export type DetailsData = {
  name: string;
  email: string;
  company: string;
  brandFile: File | null;
  currentProductFile: File | null;
  currentProductLink: string;
  links: string[];
  notes: string;
};

export function DetailsStep({
  initial,
  onContinue,
  onDirtyChange,
}: {
  initial: DetailsData;
  onContinue: (data: DetailsData) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [company, setCompany] = useState(initial.company);
  const [brandFile, setBrandFile] = useState<File | null>(initial.brandFile);
  const [currentProductFile, setCurrentProductFile] = useState<File | null>(
    initial.currentProductFile
  );
  const [currentProductLink, setCurrentProductLink] = useState(
    initial.currentProductLink
  );
  const [links, setLinks] = useState<string[]>(
    initial.links.length ? initial.links : [""]
  );
  const [notes, setNotes] = useState(initial.notes);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingCurrent, setIsDraggingCurrent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentProductInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onDirtyChange?.(
      Boolean(
        name ||
          email ||
          company ||
          brandFile ||
          currentProductFile ||
          currentProductLink ||
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

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) setBrandFile(files[0]);
  };

  const handleCurrentProductFiles = (files: FileList | null) => {
    if (files && files[0]) setCurrentProductFile(files[0]);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 pb-40 sm:px-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Show us your vibe.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-paper/60">
          Submit your branding, drop a few inspiration links / brands you
          love, and tell us about your product. We&apos;ll take it from
          there.
        </p>
      </div>

      <div className="mt-12">
        <p className="mb-3 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
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

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <p className="mb-3 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
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
            <p className="text-lg font-semibold">
              {brandFile ? brandFile.name : "Drop your brand file here"}
            </p>
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
          <p className="mb-3 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Current Product
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
            <p className="text-lg font-semibold">
              {currentProductFile
                ? currentProductFile.name
                : "Have an existing site, app, or deck?"}
            </p>
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

        <div>
          <p className="mb-3 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
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
        <p className="mb-3 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
          Product Description &amp; Notes
        </p>
        <div className="rounded-[30px] border border-panel-stroke bg-dark-950">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What are we building, who's it for, and what should it feel like? Tone, must-haves, no-gos — anything that helps us nail it on the first pass."
            className="h-[300px] w-full resize-none rounded-[30px] bg-transparent p-8 text-base outline-none placeholder:text-dark-400 sm:h-[413px]"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <PillButton
            size="xl"
            variant="paper"
            onClick={() =>
              onContinue({
                name,
                email,
                company,
                brandFile,
                currentProductFile,
                currentProductLink,
                links,
                notes,
              })
            }
            className="h-14 whitespace-nowrap"
          >
            Continue to payment →
          </PillButton>
        </div>
      </div>
    </div>
  );
}
