"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Download, Share2, Copy, GraduationCap, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateShareCard,
  shareCard,
  copyImageToClipboard,
  copyText,
  shareTexts,
  type ShareCardData,
} from "@/lib/share";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  data: ShareCardData;
  onShareTapped: (kind: "generic" | "cfi") => void;
}

export function ShareCardModal({ open, onClose, data, onShareTapped }: Props) {
  const [img, setImg] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState<null | "generic" | "cfi">(null);
  const [copiedImg, setCopiedImg] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setImg("");
    setBusy(true);
    generateShareCard(data)
      .then((url) => {
        if (!cancelled) setImg(url);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, data]);

  if (!open) return null;

  const texts = shareTexts(data);

  const doShare = async (kind: "generic" | "cfi") => {
    onShareTapped(kind);
    if (!img) return;
    await shareCard(img, kind === "cfi" ? texts.cfi : texts.generic);
  };

  const doCopyText = async (kind: "generic" | "cfi") => {
    const ok = await copyText(kind === "cfi" ? texts.cfi : texts.generic);
    if (ok) {
      setCopiedText(kind);
      setTimeout(() => setCopiedText(null), 1800);
    }
  };

  const doCopyImg = async () => {
    const ok = await copyImageToClipboard(img);
    if (ok) {
      setCopiedImg(true);
      setTimeout(() => setCopiedImg(false), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fc-bezel rounded-2xl w-full max-w-md p-5 relative max-h-[92vh] overflow-y-auto fc-scroll"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
          aria-label="Close share dialog"
        >
          <X className="size-5" />
        </button>

        <div className="text-[11px] font-mono tracking-wider text-gold mb-1">SHARE</div>
        <h3 className="font-display text-lg font-bold text-white">Your result card</h3>
        <p className="text-sm text-slate-300 mt-1 mb-4">
          Branded and ready for the group chat — or to send to your CFI.
        </p>

        <div className="rounded-xl overflow-hidden border border-sky/20 bg-navy-700/40 aspect-square grid place-items-center">
          {busy ? (
            <div className="text-sm text-slate-400 animate-pulse">Rendering card…</div>
          ) : img ? (
            <img src={img} alt="FlightCourse Radio Call Builder result card" className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-red-300">Could not render card.</div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button
            onClick={() => doShare("generic")}
            disabled={!img}
            className="w-full bg-sky text-navy hover:bg-sky/90 font-semibold"
          >
            <Share2 className="size-4" /> Share my result
          </Button>

          <Button
            onClick={() => doShare("cfi")}
            disabled={!img}
            variant="outline"
            className="w-full border-gold/50 text-gold hover:bg-gold/10 hover:text-gold font-semibold"
          >
            <GraduationCap className="size-4" /> Share with a student / CFI
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={() => doCopyText("generic")}
              variant="ghost"
              className="text-slate-300 hover:text-white border border-white/10"
            >
              {copiedText === "generic" ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              Copy text
            </Button>
            <Button
              onClick={doCopyImg}
              disabled={!img}
              variant="ghost"
              className="text-slate-300 hover:text-white border border-white/10"
            >
              {copiedImg ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              Copy image
            </Button>
          </div>

          <Button
            onClick={() => {
              onShareTapped("generic");
              import("@/lib/share").then((m) => m.downloadDataUrl(img));
            }}
            disabled={!img}
            variant="ghost"
            className="w-full text-slate-300 hover:text-white"
          >
            <Download className="size-4" /> Download PNG
          </Button>
        </div>

        <div className={cn("mt-3 rounded-lg bg-navy-700/40 border border-white/5 px-3 py-2")}>
          <div className="text-[10px] font-mono tracking-wider text-slate-400 mb-1">
            CFI / STUDENT SHARE TEXT
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{texts.cfi}</p>
        </div>
      </motion.div>
    </div>
  );
}
