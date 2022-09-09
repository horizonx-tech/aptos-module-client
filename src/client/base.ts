import { pascalCase } from 'change-case'
import { MoveModuleJSON, SignerOrClient } from './types'
import {
  defineReadOnly,
  generateAccountResourceGetter,
  generateEntryFunctionCaller,
  generateEventsGetter,
  parseMoveModule,
  throwAccountResourceGetterRequired,
  throwEventsGetterRequired,
  throwSignerRequired,
} from './utils'

export class AptosModuleClient {
  readonly signerOrClient: SignerOrClient

  constructor(abi: MoveModuleJSON, signerOrClient: SignerOrClient) {
    this.signerOrClient = signerOrClient

    const { moduleId, entryFunctionNames, keyStructNames, eventHandles } =
      parseMoveModule(abi)
    if ('signAndSubmitTransaction' in signerOrClient)
      entryFunctionNames.forEach((name) => {
        defineReadOnly(
          this,
          name,
          generateEntryFunctionCaller(signerOrClient, moduleId, name),
        )
      })
    else
      entryFunctionNames.forEach((name) => {
        defineReadOnly(this, name, throwSignerRequired)
      })

    if ('getAccountResource' in signerOrClient)
      keyStructNames.forEach((name) => {
        defineReadOnly(
          this,
          `get${name}`,
          generateAccountResourceGetter(signerOrClient, moduleId, name),
        )
      })
    else
      keyStructNames.forEach((name) => {
        defineReadOnly(this, `get${name}`, throwAccountResourceGetterRequired)
      })

    if ('getEventsByEventHandle' in signerOrClient)
      eventHandles.forEach(({ eventHandle, fieldName }) => {
        defineReadOnly(
          this,
          `get${pascalCase(fieldName)}`,
          generateEventsGetter(signerOrClient, eventHandle, fieldName),
        )
      })
    else
      eventHandles.forEach(({ fieldName }) => {
        defineReadOnly(
          this,
          `get${pascalCase(fieldName)}`,
          throwEventsGetterRequired,
        )
      })
  }
}
