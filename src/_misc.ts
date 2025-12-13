/// <reference types="bun" />

import type { PathLike } from "node:fs";
import { open } from "node:fs/promises";

interface CreateReadStreamOptions {
  offset?: number;
  length?: number;
  chunkSize?: number;
}

export const createReadStream = async function* (
  path: PathLike,
  options?: CreateReadStreamOptions,
) {
  const handle = await open(path);
  const stat = await handle.stat().catch((error) => {
    handle.close();
    throw error;
  });

  try {
    let offset = options?.offset ?? 0;
    let endOffset = options?.length == null ? stat.size : offset + Math.floor(options.length);
    let chunkSize = options?.chunkSize ?? 16384;

    while (offset < endOffset) {
      const readSize = Math.min(chunkSize, endOffset - offset);
      const chunk = await handle.read(Buffer.allocUnsafe(readSize), 0, readSize, offset);

      offset += chunk.bytesRead;
      yield chunk.buffer;
    }
  } finally {
    await handle.close();
  }
};
