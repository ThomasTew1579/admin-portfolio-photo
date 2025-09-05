import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAlbumsAndTags } from '../helpers/catalog';
import type { Album, Tag } from '../types/type';

type State = {
  albums: Album[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
};

export function useAlbumsTags() {
  const [state, setState] = useState<State>({
    albums: [],
    tags: [],
    loading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const { albums, tags } = await getAlbumsAndTags(ac.signal);
      setState({ albums, tags, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const ready = useMemo(() => !state.loading && !state.error, [state.loading, state.error]);

  return {
    albums: state.albums,
    tags: state.tags,
    loading: state.loading,
    error: state.error,
    ready,
    refresh: load,
  };
}
