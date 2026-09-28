import { useEffect } from "react";

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title.includes("Skill2Bills") ? title : `${title} | Skill2Bills`;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    let previousDesc = metaDesc ? metaDesc.getAttribute("content") : "";

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (metaDesc && previousDesc) {
        metaDesc.setAttribute("content", previousDesc);
      }
    };
  }, [title, description]);
}
