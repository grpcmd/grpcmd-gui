import { arrayMove } from '@dnd-kit/sortable'
import { type StoreApi, type UseBoundStore, create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

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

export type WindowState = {
  editingNameOfRequestId: string
  activeRequestId: string
  sortOrder: string[]
  requests: {
    [key: string]: {
      id: string
      title: string
      address: string
      method: string
      request: string
      response: string
    }
  }
}

const getInitialState = (): WindowState => {
  const id = crypto.randomUUID()

  return {
    editingNameOfRequestId: '',
    activeRequestId: id,
    sortOrder: [id],
    requests: {
      [id]: {
        id: id,
        title: 'New Request',
        address: '',
        method: '',
        request: '',
        response: '',
      },
    },
  }
}

export const useWindowStore = createSelectors(
  create(
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
                request: '',
                response: '',
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
              }
            }),
          setEditingNameOfRequestId: (id: string) =>
            set((state) => {
              state.editingNameOfRequestId = id
            }),
        }
      }),
    ),
  ),
)
