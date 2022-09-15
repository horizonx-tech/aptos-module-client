import { MaybeHexString } from 'aptos'
import {
  EntryFunctionPayload,
  IdentifierWrapper,
  MoveStruct,
  MoveStructField,
  SubmitTransactionRequest,
} from 'aptos/dist/generated'
import {
  AptosSigner,
  EventGetterParams,
  MoveModuleJSON,
  SignerOrClient,
} from './types'

export const generateEntryFunctionCaller =
  (signer: AptosSigner, moduleId: string, functionName: IdentifierWrapper) =>
  (
    payload: Partial<Omit<EntryFunctionPayload, 'function'>> = {},
    options: Partial<SubmitTransactionRequest> = undefined,
  ) =>
    signer.signAndSubmitTransaction(
      {
        type: 'entry_function_payload',
        function: `${moduleId}::${functionName}`,
        type_arguments: payload?.type_arguments || [],
        arguments: payload?.arguments || [],
      },
      options,
    )

export const generateAccountResourceGetter =
  (client: SignerOrClient, moduleId: string, structName: string) =>
  (account: MaybeHexString, typeParameter?: string) =>
    client.getAccountResource(
      account,
      `${moduleId}::${structName}${typeParameter ? `<${typeParameter}>` : ''}`,
    )

export const generateEventsGetter =
  (client: SignerOrClient, eventHandle: string, fieldName: string) =>
  (account: MaybeHexString, params?: EventGetterParams) =>
    client.getEventsByEventHandle(
      account,
      `${eventHandle}${
        params?.typeParameter ? `<${params.typeParameter}>` : ''
      }`,
      fieldName,
      params?.query,
    )

export const defineReadOnly = (object: any, name: string, value: any) => {
  Object.defineProperty(object, name, {
    value,
    enumerable: true,
    writable: false,
  })
}

export const parseMoveModule = ({
  address,
  name,
  exposed_functions,
  structs,
}: MoveModuleJSON) => {
  const moduleId = `${address}::${name}`
  const keyStructs = structs.filter(isResource)
  return {
    moduleId,
    entryFunctionNames: exposed_functions
      .filter(({ is_entry }) => is_entry)
      .map(({ name }) => name),
    keyStructNames: keyStructs.map(({ name }) => name),
    eventHandles: keyStructs.flatMap(({ name, fields }) =>
      fields.filter(isEventHandle).map(({ name: fieldName }) => ({
        eventHandle: `${moduleId}::${name}`,
        fieldName,
      })),
    ),
  }
}

export const throwSignerRequired = () => {
  throw new Error('Client is not able to sign transactions.')
}

export const throwAccountResourceGetterRequired = () => {
  throw new Error(
    'Signer does not implement the "getAccountResource" function.',
  )
}

export const throwEventsGetterRequired = () => {
  throw new Error(
    'Signer does not implement the "getEventsByEventHandle" function.',
  )
}

const isString = (arg: any): arg is string => typeof arg === 'string'

const isResource = (struct: MoveStruct) => struct.abilities.includes('key')

const isEventHandle = (field: MoveStructField) =>
  isString(field.type) && field.type.startsWith('0x1::event::EventHandle')
