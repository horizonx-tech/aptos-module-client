import { AptosClient, Types } from 'aptos'

export type MoveModuleJSON = Omit<Types.MoveModule, 'exposed_functions'> & {
  exposed_functions: Array<
    Omit<Types.MoveFunction, 'visibility'> & {
      visibility: 'private' | 'public' | 'friend'
    }
  >
}

export type AptosSigner = {
  signAndSubmitTransaction: (
    payload: Types.EntryFunctionPayload,
    options?: Partial<Types.SubmitTransactionRequest>,
  ) => Promise<Types.HashValue>
  getAccountResource?: AptosClient['getAccountResource']
  getEventsByEventHandle?: AptosClient['getEventsByEventHandle']
}

export type SignerOrClient = AptosClient | AptosSigner

export type TypedMoveResource<T = any> = Omit<Types.MoveResource, 'data'> & {
  data: T
}

export type TypedVersionedEvent<T = any> = Omit<
  Types.VersionedEvent,
  'data'
> & {
  data: T
}

export type EventGetterParams = {
  typeParameter?: string
  query?: Parameters<AptosClient['getEventsByEventHandle']>[3]
}
