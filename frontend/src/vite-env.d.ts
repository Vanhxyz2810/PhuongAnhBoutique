/// <reference types="vite/client" />

interface Window {
  FB?: {
    init: (config: any) => void;
    XFBML: {
      parse: () => void;
    };
  };
}
