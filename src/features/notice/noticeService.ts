export type NoticeType = 'success' | 'error' | 'info';

type NoticePayload = {
  message: string;
  type: NoticeType;
};

type Listener = (payload: NoticePayload) => void;

const listeners = new Set<Listener>();

export const noticeService = {
  show(message: string, type: NoticeType = 'info') {
    listeners.forEach((listener) => listener({ message, type }));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
