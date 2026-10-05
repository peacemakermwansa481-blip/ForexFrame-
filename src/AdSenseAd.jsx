import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-1180826622510992";

export default function AdSenseAd({ slot = "" }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!slot || !adRef.current) return undefined;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      // Ad availability and script timing must never interrupt the journal UI.
      console.warn("ForexFrame AdSense ad was unavailable", error);
    }

    return undefined;
  }, [slot]);

  // A publisher/client ID alone cannot render an ad. Do not show a fake
  // placeholder or send an incomplete request until a real ad-slot ID exists.
  if (!slot) return null;

  return (
    <section className="adsense-placement" aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  );
}
