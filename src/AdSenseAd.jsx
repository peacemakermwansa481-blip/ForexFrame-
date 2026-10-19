import React, { Component, useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-1180826622510992";

class AdSenseErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Ads are optional and must never take down the journal dashboard.
    console.warn("ForexFrame AdSense ad was disabled after a rendering error");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function AdSenseAdContent({ slot = "" }) {
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

export default function AdSenseAd({ slot = "" }) {
  return (
    <AdSenseErrorBoundary>
      <AdSenseAdContent slot={slot} />
    </AdSenseErrorBoundary>
  );
}
