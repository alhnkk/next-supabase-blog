import { useEffect, useState } from "react";

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only set to true if we're actually in the browser
    if (typeof window !== "undefined") {
      setIsHydrated(true);
    }
  }, []);

  return isHydrated;
}
