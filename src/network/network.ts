import { assert } from "../validate/validate.ts";
import type { ExtendedFetch, FetchParams, LoadMetadata } from "./types.ts";

const loadMetadata: LoadMetadata = (mediaElement) =>
  new Promise((resolve, reject) => {
    const cleanup = (...args: any[]) => {
      mediaElement.onloadedmetadata = mediaElement.onerror = null;
      return null;
    };
    mediaElement.onloadedmetadata = () => cleanup(resolve(mediaElement));
    mediaElement.onerror = () => cleanup(reject(new Error("Failed to load metadata")));
  });

export const fetch: ExtendedFetch = Object.assign(
  (...params: FetchParams) => globalThis.fetch(...params),
  {
    ok: async (...params: FetchParams) => {
      const response = await fetch(...params);
      assert.true(response.ok, "The response was not okay.");
      return response as Response & { ok: true };
    },

    arraybuffer: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return response.arrayBuffer();
    },

    blob: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return response.blob();
    },

    bytes: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return response.bytes();
    },

    headers: async (...params: FetchParams) => {
      const response = await fetch(...params);
      return Object.assign(response.headers, {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });
    },

    json: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return response.json();
    },

    stream: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      const body = response.body;

      if (!body) throw new Error("No response body.");
      return body;
    },

    text: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return response.text();
    },

    audio: async (...params: FetchParams) => {
      const blob = await fetch.blob(...params);
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      return loadMetadata(audio);
    },

    image: async (...params: FetchParams) => {
      const blob = await fetch.blob(...params);
      const url = URL.createObjectURL(blob);

      const image = document.createElement("img");
      image.src = url;

      await image.decode();
      URL.revokeObjectURL(url);

      return image;
    },

    video: async (...params: FetchParams) => {
      const blob = await fetch.blob(...params);
      const video = document.createElement("video");
      video.src = URL.createObjectURL(blob);
      return loadMetadata(video);
    },
  },
);

export * from "./types.ts";
