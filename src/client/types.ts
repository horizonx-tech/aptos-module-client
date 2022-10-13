import { AptosClient, Types } from 'aptos'

export type MoveModuleJSON = Omit<Types.MoveModule, 'exposed_functions'> & {
  exposed_functions: Array<
    Omit<Types.MoveFunction, 'visibility'> & {
      visibility: 'private' | 'public' | 'friend'
    }
  >
}

export type MoveFunctionMinified = Pick<
  Types.MoveFunction,
  'name' | 'is_entry' | 'params'
> & { generic_type_params: {}[] }

export type MoveStructFieldMinified = {
  name: Types.MoveStructField['name']
  type?: Types.MoveStructField['type']
}

export type MoveStructMinified = Pick<
  Types.MoveStruct,
  'name' | 'abilities'
> & { fields: MoveStructFieldMinified[] }

export type MoveModuleJSONMinified = {
  address: Types.MoveModule['address']
  name: Types.MoveModule['name']
  exposed_functions: MoveFunctionMinified[]
  structs: MoveStructMinified[]
}

export type AptosSigner = {
  signAndSubmitTransaction: (
    payload: Types.EntryFunctionPayload & { type?: 'entry_function_payload' },
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
