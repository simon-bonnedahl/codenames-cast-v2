type CastReceiverMessageEvent = {
  data: unknown;
};

type CastReceiverContext = {
  addCustomMessageListener: (
    namespace: string,
    listener: (event: CastReceiverMessageEvent) => void,
  ) => void;
  start: (options?: CastReceiverOptions) => void;
};

type CastReceiverOptions = {
  disableIdleTimeout: boolean;
};

type CastSession = {
  sendMessage: (namespace: string, message: unknown) => Promise<void>;
};

type CastContext = {
  setOptions: (options: {
    receiverApplicationId: string;
    autoJoinPolicy?: string;
  }) => void;
  getCurrentSession: () => CastSession | null;
  requestSession: () => Promise<void>;
};

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    chrome?: {
      cast?: {
        AutoJoinPolicy: {
          ORIGIN_SCOPED: string;
        };
      };
    };
    cast?: {
      framework?: {
        CastContext: {
          getInstance: () => CastContext;
        };
        CastReceiverContext: {
          getInstance: () => CastReceiverContext;
        };
        CastReceiverOptions: new () => CastReceiverOptions;
      };
    };
  }
}

export {};