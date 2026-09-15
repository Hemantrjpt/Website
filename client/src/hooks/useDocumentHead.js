import { useEffect } from 'react';

// Sets document.title + the meta description, and optionally injects a
// JSON-LD structured-data script for the current page. No extra dependency
// (react-helmet etc.) needed for something this small.
export function useDocumentHead({ title, description, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;

    let metaTag;
    if (description) {
      metaTag = document.querySelector('meta[name="description"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'description');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', description);
    }

    let ldScript;
    if (jsonLd) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(ldScript);
    }

    return () => {
      if (ldScript) ldScript.remove();
    };
  }, [title, description, jsonLd]);
}
