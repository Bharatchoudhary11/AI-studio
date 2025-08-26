export interface GenerationRequest {
  imageDataUrl: string;
  prompt: string;
  style: string;
  signal?: AbortSignal;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
}

export function mockGenerate({ imageDataUrl, prompt, style, signal }: GenerationRequest): Promise<GenerationResult> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      if (Math.random() < 0.2) {
        reject(new Error('Model overloaded'));
        return;
      }
      resolve({
        id: crypto.randomUUID(),
        imageUrl: imageDataUrl,
        prompt,
        style,
        createdAt: new Date().toISOString(),
      });
    }, 1000 + Math.random() * 1000);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
