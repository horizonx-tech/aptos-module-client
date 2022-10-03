import { AptosClient, MaybeHexString, Types } from 'aptos'
import {
  Event,
  MoveFunction,
  MoveModule,
  MoveResource,
  MoveStructTag,
  SubmitTransactionRequest,
  TransactionPayload,
} from 'aptos/dist/generated'

export type MoveModuleJSON = Omit<MoveModule, 'exposed_functions'> & {
  exposed_functions: Array<
    Omit<MoveFunction, 'visibility'> & {
      visibility: 'private' | 'public' | 'friend'
    }
  >
}

export type AptosSigner = {
  signAndSubmitTransaction: (
    payload: TransactionPayload,
    options?: Partial<SubmitTransactionRequest>,
  ) => Promise<Types.HashValue>
  getAccountResource?: (
    accountAddress: MaybeHexString,
    resourceType: MoveStructTag,
    query?: { ledgerVersion?: BigInt },
  ) => Promise<MoveResource>
  getEventsByEventHandle?: (
    address: MaybeHexString,
    eventHandleStruct: MoveStructTag,
    fieldName: string,
    query?: { start?: BigInt; limit?: number },
  ) => Promise<Event[]>
}

export type SignerOrClient = AptosClient | AptosSigner

export type TypedMoveResource<T = any> = {
  type: MoveStructTag
  data: T
}

export type TypedEvent<T = any> = Omit<Event, 'data'> & {
  data: T
}

export type EventGetterParams = {
  typeParameter?: string
  query?: { start?: BigInt; limit?: number }
}
