"use client";

import React, { useState } from "react";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Input } from "@/components/ui/input";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MdDocumentScanner } from "react-icons/md";
import { motion } from "framer-motion";
import { FcImageFile } from "react-icons/fc";
import { Ripple } from "@/components/magicui/ripple";

type ExtractedData = {
  fullName: string;
  dateOfBirth: string;
  documentNumber: string;
  address: string;
  typeOfDocument: string;
};

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG or PNG).");
      return;
    }

    setProgress(10);
    setLoading(true);
    setError(null);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64WithPrefix = reader.result as string;
      const base64 = base64WithPrefix.split(",")[1];
      setProgress(30);

      try {
        const res = await fetch("/api/v1/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        setProgress(70);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Extraction failed.");

        setExtractedData(json.data);
        setProgress(100);
      } catch (err: any) {
        setError(err.message);
        setProgress(0);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <main className="relative min-h-screen bg-green-100 text-gray-900 overflow-hidden">
      {/* Ripple background (beneath content) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Ripple />
      </div>

      {/* Header (excluded from ripple) */}
      <header className="relative z-10 w-full py-5 flex items-center justify-center border-b border-gray-200 bg-green-100">
        <nav className="w-11/12 max-w-7xl flex justify-between items-center">
          <SparklesText className="text-xl font-bold flex items-center justify-center">
            <a href="/" className="flex items-center justify-center gap-2">
              <MdDocumentScanner /> OCR AI
            </a>
          </SparklesText>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center w-full py-10 px-4 flex-col">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-center lg:text-left my-10">
          {/* Left Column */}
          <div className="relative space-y-5 flex flex-col items-center lg:items-start">
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute left-0 w-full h-1 bg-blue-600 z-20"
                initial={{ top: "-40%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <FcImageFile className="w-full h-full z-10 relative" />
            </div>

            <AuroraText className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-center lg:text-left">
              Open Source OCR
            </AuroraText>

            <p className="text-base md:text-lg text-gray-600 font-medium">
              Extract structured data from Aadhar, PAN, and Passport using AI.
            </p>
            <p className="text-sm text-gray-500">
              Upload your document and let AI do the rest.
            </p>
            <p className="text-sm text-gray-500">
              We don’t store or save any data.
            </p>
          </div>

          {/* Right Column */}
          <div className="w-full py-16">
            <form className="w-full py-6 p-10 rounded-lg border border-green-700 shadow-xl bg-green-50 space-y-3">
              <Label className="text-md font-medium">Select Image</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {progress > 0 && progress < 100 && (
                <Progress value={progress} className="h-2" />
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>

        {/* Extracted Data Output */}
        {extractedData && (
          <div className="my-10 p-4 border rounded bg-green-100 space-y-2 text-sm text-left w-full lg:max-w-7xl border-green-800">
            <p className="text-sm text-yellow-500 font-bold my-4">
              Note: We don’t store or save any data.
            </p>
            <p>
              <strong>Document Type:</strong> {extractedData.typeOfDocument}
            </p>
            <p>
              <strong>Full Name:</strong> {extractedData.fullName}
            </p>
            <p>
              <strong>Date of Birth:</strong> {extractedData.dateOfBirth}
            </p>
            <p>
              <strong>Document Number:</strong> {extractedData.documentNumber}
            </p>
            <p>
              <strong>Address:</strong> {extractedData.address}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full border-t border-gray-400 bg-green-100 py-5">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-700 font-bold">
            Designed & Developed by{" "}
            <a
              href="https://eswarb.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Eswar
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
