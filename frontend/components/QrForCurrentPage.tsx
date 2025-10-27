"use client";

import * as React from "react";
import QRCode from "qrcode";

type QrForCurrentPageProps = {
  size?: number;
  rounded?: boolean;
  className?: string;
};

export function QrForCurrentPage({
  size = 256,
  rounded = true,
  className = "",
}: QrForCurrentPageProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [href, setHref] = React.useState<string>("");

  React.useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    setHref(url);
    if (!url) return;

    QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: {
        dark: "#FFFFFF",
        light: "#00000000",
      },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [size]);

  if (!dataUrl) return null;

  return (
    <div
      className={[
        "inline-flex flex-col items-center p-4",
        rounded ? "rounded-2xl" : "rounded",
        className,
      ].join(" ")}
    >
      <img
        src={dataUrl}
        alt="QR to this page"
        width={size}
        height={size}
        className="select-none"
        draggable={false}
      />
    </div>
  );
}
