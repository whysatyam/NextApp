import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { createZustandContext } from "./zustand-context";
import React from "react";
import { useStore } from "zustand";

type State = {
  generating: boolean;
  setGenerating: (generating: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
};

const getStore = (initialState: {
  generating: boolean;
  activeTag: string;
  activeColor: string;
}) => {
  return createStore<State>()(
    persist(
      (set) => ({
        generating: initialState.generating,
        setGenerating: (generating) => set({ generating }),
        tags: [],
        setTags: (tags) => set({ tags }),
        activeTag: initialState.activeTag,
        setActiveTag: (tag) => set({ activeTag: tag }),
        activeColor: initialState.activeColor,
        setActiveColor: (color) => set({ activeColor: color }),
      }),
      { name: "image-store", storage: createJSONStorage(() => localStorage) }
    )
  );
};

export const ImageStore = createZustandContext(getStore);

export function useImageStore<T>(selector: (state: State) => T) {
  const store = React.useContext(ImageStore.Context);
  if (!store) {
    throw new Error("missing image store provider");
  }
  return useStore(store, selector);
}
