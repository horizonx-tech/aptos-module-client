import { AptosClient, MaybeHexString } from 'aptos'
import {
  Event,
  MoveFunction,
  MoveModule,
  MoveResource,
  MoveStructTag,
  PendingTransaction,
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
  ) => Promise<PendingTransaction>
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

export type TypedMoveResource<T = any> = Omit<MoveResource, 'data'> & {
  data: T
}

export type TypedEvent<T = any> = Omit<Event, 'data'> & {
  data: T
}

export type EventGetterParams = {
  typeParameter?: string
  query?: { start?: BigInt; limit?: number }
}
