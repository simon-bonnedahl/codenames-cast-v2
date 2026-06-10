import Script from "next/script";
import type { PropsWithChildren } from "react";

export default function ReceiverLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Script
        src="https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
