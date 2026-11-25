import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const sectionId = hash.replace("#", "");

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    // Wait for the page to render before scrolling
    requestAnimationFrame(scrollToSection);
  }, [pathname, hash]);

  return null;
}

export default ScrollToHash;
