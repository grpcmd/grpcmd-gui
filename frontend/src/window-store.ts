import { arrayMove } from '@dnd-kit/sortable'
import { Events } from '@wailsio/runtime'
import { type StoreApi, type UseBoundStore, create } from 'zustand'
import {
  type PersistStorage,
  type StorageValue,
  combine,
  persist,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'
import {
  GetItem,
  RemoveItem,
  SetItem,
} from '../bindings/github.com/grpcmd/grpcmd-gui/configservice'
import debounce from './lib/debounce'

// START: Code modified from: https://zustand.docs.pmnd.rs/guides/auto-generating-selectors
type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & {
      use: { [K in keyof T]: () => T[K] }
      useShallow: { [K in keyof T]: () => T[K] }
    }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  store.useShallow = {}
  for (const k of Object.keys(store.getState())) {
    // biome-ignore lint/suspicious/noExplicitAny: Code from source
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
    // biome-ignore lint/suspicious/noExplicitAny: Code from source above
    ;(store.useShallow as any)[k] = () =>
      store(useShallow((s) => s[k as keyof typeof s]))
  }

  return store
}
// END

// Flag to prevent unnecessary store rehydration when modifications are from the client.
let isWritingConfigFromClient = false

// @ts-ignore
const debouncedSetItem = debounce(async (key: string, value: string) => {
  await SetItem(key, value)
}, 1000)
// @ts-ignore
const debouncedRemoveItem = debounce(async (key: string) => {
  await RemoveItem(key)
}, 1000)

// Custom storage object.
const storage: PersistStorage<Partial<WindowState>> = {
  getItem: async (name) => {
    const storageValue = JSON.parse(await GetItem(name)) as StorageValue<
      Partial<WindowState>
    >
    const state = storageValue.state
    if (!state || !state.requests) return storageValue

    const now = Date.now()
    const deleteRequestAfterMs = state.deleteRequestAfterMs || 604800000 // Default to 7 days if not set

    // If deleteRequestAfterMs is 0, don't filter out requests
    if (deleteRequestAfterMs === 0) return storageValue

    // Filter out old requests
    const requestsToKeep = Object.entries(state.requests).filter(
      ([_, request]) => {
        const updatedAt = new Date(request.updatedAt).getTime()
        return now - updatedAt < deleteRequestAfterMs
      },
    )

    if (requestsToKeep.length < Object.keys(state.requests).length) {
      if (requestsToKeep.length === 0) {
        // If all requests were filtered out, create a new default request
        const id = crypto.randomUUID()
        state.requests = {
          [id]: {
            id: id,
            title: 'New Request',
            address: '',
            method: '',
            methodSource: '',
            request: '',
            response: '',
            updatedAt: new Date().toISOString(),
          },
        }
        state.sortOrder = [id]
        state.activeRequestId = id
      } else {
        // Update state with filtered requests
        state.requests = Object.fromEntries(requestsToKeep)
        // biome-ignore lint/style/noNonNullAssertion: sortOrder and requests should always be defined.
        state.sortOrder = state.sortOrder!.filter((id) => state.requests![id])

        // If active request was deleted, set to first available request
        if (
          // biome-ignore lint/style/noNonNullAssertion: there should always be an active request.
          !state.requests[state.activeRequestId!] &&
          state.sortOrder.length > 0
        ) {
          state.activeRequestId = state.sortOrder[0]
        }
      }
    }

    return storageValue
  },
  setItem: async (name, value) => {
    isWritingConfigFromClient = true
    // TODO: If multiple stores use this storage, make sure there is a debounce function for each unique name.
    await debouncedSetItem(name, JSON.stringify(value, null, 2))
    setTimeout(() => {
      isWritingConfigFromClient = false
      // Wait 2000ms to avoid fsnotify callbacks from running.
    }, 2000)
  },
  removeItem: async (name) => {
    isWritingConfigFromClient = true
    // TODO: If multiple stores use this storage, make sure there is a debounce function for each unique name.
    await debouncedRemoveItem(name)
    setTimeout(() => {
      isWritingConfigFromClient = false
      // Wait 2000ms to avoid fsnotify callbacks from running.
    }, 2000)
  },
}

export type WindowState = {
  editingNameOfRequestId: string
  activeRequestId: string
  sortOrder: string[]
  theme: string
  deleteRequestAfterMs: number
  protoPaths: string[]
  protoFiles: string[]
  hasSeenOnboarding: boolean
  hasSeenTour: boolean
  requests: {
    [key: string]: {
      id: string
      title: string
      address: string
      method: string
      methodSource: string
      request: string
      response: string
      updatedAt: string
    }
  }
}

const getInitialState = (): WindowState => {
  const id = crypto.randomUUID()

  return {
    editingNameOfRequestId: '',
    activeRequestId: id,
    sortOrder: [id],
    theme: 'light',
    deleteRequestAfterMs: 604800000, // 7 days in milliseconds
    protoPaths: [],
    protoFiles: [],
    hasSeenOnboarding: false,
    hasSeenTour: true, // The end of the onboarding sets this to false to start to tour.
    requests: {
      [id]: {
        id: id,
        title: 'New Request',
        address: '',
        method: '',
        methodSource: '',
        request: '',
        response: '',
        updatedAt: new Date().toISOString(),
      },
    },
  }
}

export const useWindowStore = createSelectors(
  create(
    persist(
      immer(
        combine(getInitialState(), (set, _) => {
          return {
            addRequest: () =>
              set((state) => {
                const id = crypto.randomUUID()
                state.requests[id] = {
                  id: id,
                  title: 'New Request',
                  address: '',
                  method: '',
                  methodSource: '',
                  request: '',
                  response: '',
                  updatedAt: new Date().toISOString(),
                }
                state.sortOrder.unshift(id)

                state.activeRequestId = id
                state.editingNameOfRequestId = id
              }),
            duplicateRequest: (id: string) =>
              set((state) => {
                const index = state.sortOrder.indexOf(id)
                const newId = crypto.randomUUID()
                state.requests[newId] = {
                  ...state.requests[id],
                  id: newId,
                  title: `Copy of ${state.requests[id].title}`,
                  updatedAt: new Date().toISOString(),
                }
                state.sortOrder.splice(index + 1, 0, newId)
              }),
            deleteRequest: (id: string) =>
              set((state) => {
                if (state.sortOrder.length > 1) {
                  // Don't delete the last request. TODO: Create a view with no requests.
                  delete state.requests[id]
                  const index = state.sortOrder.indexOf(id)
                  state.sortOrder.splice(index, 1)
                  if (state.activeRequestId === id) {
                    if (index === state.sortOrder.length) {
                      state.activeRequestId = state.sortOrder[index - 1]
                    } else {
                      state.activeRequestId = state.sortOrder[index]
                    }
                  }
                }
              }),
            dndMoveRequests: (fromId: string, toId: string) =>
              set((state) => {
                const oldIndex = state.sortOrder.indexOf(fromId)
                const newIndex = state.sortOrder.indexOf(toId)
                state.sortOrder = arrayMove(state.sortOrder, oldIndex, newIndex)
              }),
            setActiveRequestId: (id: string) =>
              set((state) => {
                state.activeRequestId = id
              }),
            updateActiveRequest: (
              req: Partial<
                WindowState['requests'][keyof WindowState['requests']]
              >,
            ) =>
              set((state) => {
                state.requests[state.activeRequestId] = {
                  ...state.requests[state.activeRequestId],
                  ...req,
                  updatedAt: new Date().toISOString(),
                }
              }),
            updateRequest: (
              reqId: string,
              req: Partial<
                WindowState['requests'][keyof WindowState['requests']]
              >,
            ) =>
              set((state) => {
                state.requests[reqId] = {
                  ...state.requests[reqId],
                  ...req,
                  updatedAt: new Date().toISOString(),
                }
              }),
            setEditingNameOfRequestId: (id: string) =>
              set((state) => {
                state.editingNameOfRequestId = id
              }),
            setTheme: (theme: string) =>
              set((state) => {
                state.theme = theme
              }),
            setDeleteRequestAfterMs: (ms: number) =>
              set((state) => {
                state.deleteRequestAfterMs = ms
              }),
            addProtoPaths: (paths: string[]) =>
              set((state) => {
                const newPaths = paths.filter(
                  (path) => !state.protoPaths.includes(path),
                )
                state.protoPaths.push(...newPaths)
                state.protoPaths.sort()
              }),
            deleteProtoPaths: (paths: string[]) =>
              set((state) => {
                state.protoPaths = state.protoPaths.filter(
                  (p) => !paths.includes(p),
                )
              }),
            addProtoFiles: (files: string[]) =>
              set((state) => {
                const newFiles = files.filter(
                  (file) => !state.protoFiles.includes(file),
                )
                state.protoFiles.push(...newFiles)
                state.protoFiles.sort()
              }),
            deleteProtoFiles: (files: string[]) =>
              set((state) => {
                state.protoFiles = state.protoFiles.filter(
                  (f) => !files.includes(f),
                )
              }),
            setHasSeenOnboarding: (seen: boolean) =>
              set((state) => {
                state.hasSeenOnboarding = seen
              }),
            setHasSeenTour: (seen: boolean) =>
              set((state) => {
                state.hasSeenTour = seen
              }),
          }
        }),
      ),
      {
        name: 'window-store',
        storage: storage,
        partialize: (state) => ({
          activeRequestId: state.activeRequestId,
          requests: state.requests,
          sortOrder: state.sortOrder,
          theme: state.theme,
          deleteRequestAfterMs: state.deleteRequestAfterMs,
          protoPaths: state.protoPaths,
          protoFiles: state.protoFiles,
          hasSeenOnboarding: state.hasSeenOnboarding,
          hasSeenTour: state.hasSeenTour,
        }),
      },
    ),
  ),
)

Events.On('configChanged:window-store', () => {
  if (!isWritingConfigFromClient) {
    console.debug('configChanged:window-store')
    useWindowStore.persist.rehydrate()
  }
})

if (import.meta.hot) {
  // Prevent multiple listeners during hot module replacement in development.
  import.meta.hot.on('vite:beforeUpdate', () => {
    Events.Off('configChanged:window-store')
  })
}
