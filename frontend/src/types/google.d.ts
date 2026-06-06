type GoogleCredentialResponse = { credential: string };
type GoogleTokenResponse = { access_token?: string; error?: string };

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
        renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; width: number }) => void;
      };
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: GoogleTokenResponse) => void;
        }) => { requestAccessToken: () => void };
      };
    };
  };
}
