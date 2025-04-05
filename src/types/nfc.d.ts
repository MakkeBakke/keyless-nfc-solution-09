
interface NDEFReaderEventInit extends EventInit {
  serialNumber?: string;
  message?: NDEFMessage;
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: string | BufferSource | NDEFRecordInit;
  encoding?: string;
  lang?: string;
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: string | BufferSource | NDEFRecordInit[];
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEventHandler {
  (event: NDEFReadingEvent): void;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

declare class NDEFReader extends EventTarget {
  constructor();
  
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(message: NDEFMessage | { records: NDEFRecordInit[] }, options?: NDEFWriteOptions): Promise<void>;
  
  addEventListener(type: 'reading', callback: NDEFReadingEventHandler, options?: AddEventListenerOptions): void;
  addEventListener(type: 'readingerror', callback: EventListener, options?: AddEventListenerOptions): void;
  addEventListener(type: string, callback: EventListener, options?: AddEventListenerOptions): void;
  
  removeEventListener(type: 'reading', callback: NDEFReadingEventHandler, options?: EventListenerOptions): void;
  removeEventListener(type: 'readingerror', callback: EventListener, options?: EventListenerOptions): void;
  removeEventListener(type: string, callback: EventListener, options?: EventListenerOptions): void;
}
