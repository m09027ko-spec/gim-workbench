import { useEffect, useState } from "react";

type CopyButtonProps = {
  text: string;
  disabled?: boolean;
};

function fallbackCopy(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.top = "-1000px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export function CopyButton({ text, disabled = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy(): Promise<void> {
    if (disabled || !text.trim()) {
      return;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopied(true);
    } catch {
      const copiedByFallback = fallbackCopy(text);
      setCopied(copiedByFallback);
    }
  }

  return (
    <button className="button primary" type="button" onClick={handleCopy} disabled={disabled}>
      {copied ? "コピーしました" : "コピーする"}
    </button>
  );
}
