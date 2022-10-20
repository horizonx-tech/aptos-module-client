import { Types } from 'aptos'
import { AptosSigner } from 'src'
import {
  defineReadOnly,
  generateAccountResourceGetter,
  generateEntryFunctionCaller,
  generateEventsGetter,
  parseMoveModule,
  throwAccountResourceGetterRequired,
  throwEventsGetterRequired,
  throwSignerRequired,
} from 'src/client/utils'
import { MOCK_ABI } from '../__mocks__/abi'

describe('utils', () => {
  describe('generateEntryFunctionCaller', () => {
    let mockSigner: AptosSigner
    beforeEach(() => {
      mockSigner = {
        signAndSubmitTransaction: jest.fn(),
      }
    })
    const moduleId = '0x1::coin'
    const functionName = 'transfer'

    const payloadType = 'entry_function_payload'
    const payload = {
      type_arguments: ['0x1::aptos_coin::AptosCoin'],
      arguments: ['0x2', 100],
    }
    it('generated caller can call "signAndSubmitTransaction" with passed parameters', () => {
      const call = generateEntryFunctionCaller(
        mockSigner,
        moduleId,
        functionName,
      )
      call(payload)

      expect(mockSigner.signAndSubmitTransaction).toHaveBeenCalledWith(
        {
          type: payloadType,
          function: `${moduleId}::${functionName}`,
          ...payload,
        },
        undefined,
      )
    })
    it('generated caller can call without passing parameters', () => {
      const call = generateEntryFunctionCaller(
        mockSigner,
        moduleId,
        functionName,
      )
      call()
      expect(mockSigner.signAndSubmitTransaction).toHaveBeenLastCalledWith(
        {
          type: payloadType,
          function: `${moduleId}::${functionName}`,
          type_arguments: [],
          arguments: [],
        },
        undefined,
      )
      call({})
      expect(mockSigner.signAndSubmitTransaction).toHaveBeenLastCalledWith(
        {
          type: payloadType,
          function: `${moduleId}::${functionName}`,
          type_arguments: [],
          arguments: [],
        },
        undefined,
      )
    })
    it('generated caller can call with options', () => {
      const options: Partial<Types.SubmitTransactionRequest> = {
        max_gas_amount: '9999',
      }
      const call = generateEntryFunctionCaller(
        mockSigner,
        moduleId,
        functionName,
      )
      call(payload, options)

      expect(mockSigner.signAndSubmitTransaction).toHaveBeenCalledWith(
        {
          type: payloadType,
          function: `${moduleId}::${functionName}`,
          ...payload,
        },
        options,
      )
    })
    describe('generated caller can return hash', () => {
      const hash = 'hash'
      it('Signer returns string', async () => {
        const mockFn = jest.fn()
        mockFn.mockReturnValue(hash)
        mockSigner.signAndSubmitTransaction = mockFn
        const call = generateEntryFunctionCaller(
          mockSigner,
          moduleId,
          functionName,
        )
        const res = await call()
        expect(res).toBe(hash)
      })
      it('Signer returns { hash: string }', async () => {
        const mockFn = jest.fn()
        mockFn.mockReturnValue({ hash })
        mockSigner.signAndSubmitTransaction = mockFn
        const call = generateEntryFunctionCaller(
          mockSigner,
          moduleId,
          functionName,
        )
        const res = await call()
        expect(res).toBe(hash)
      })
    })
  })
  describe('generateAccountResourceGetter', () => {
    let mockSigner: AptosSigner
    beforeEach(() => {
      mockSigner = {
        signAndSubmitTransaction: jest.fn(),
        getAccountResource: jest.fn(),
      }
    })
    const moduleId = '0x1::coin'
    const structName = 'ConInfo'
    const account = '0x2'
    it('generated getter can call "getAccountResource" with passed parameters', () => {
      const call = generateAccountResourceGetter(
        mockSigner,
        moduleId,
        structName,
      )
      call(account)

      expect(mockSigner.getAccountResource).toHaveBeenCalledWith(
        account,
        `${moduleId}::${structName}`,
      )
    })
    it('generated getter can call with a type paremter', () => {
      const typeParameter = '0x1::aptos_coin::AptosCoin'
      const call = generateAccountResourceGetter(
        mockSigner,
        moduleId,
        structName,
      )
      call(account, typeParameter)

      expect(mockSigner.getAccountResource).toHaveBeenCalledWith(
        account,
        `${moduleId}::${structName}<${typeParameter}>`,
      )
    })
  })
  describe('generateEventsGetter', () => {
    let mockSigner: AptosSigner
    beforeEach(() => {
      mockSigner = {
        signAndSubmitTransaction: jest.fn(),
        getEventsByEventHandle: jest.fn(),
      }
    })
    const eventHandle = '0x1::coin::CoinStore'
    const fieldName = 'deposit_events'
    const account = '0x2'
    it('generated getter can call "getEventsByEventHandle" with passed parameters', () => {
      const call = generateEventsGetter(mockSigner, eventHandle, fieldName)
      call(account)

      expect(mockSigner.getEventsByEventHandle).toHaveBeenCalledWith(
        account,
        eventHandle,
        fieldName,
        undefined,
      )
    })
    it('generated getter can call with a type paremter', () => {
      const typeParameter = '0x1::aptos_coin::AptosCoin'
      const call = generateEventsGetter(mockSigner, eventHandle, fieldName)
      call(account, { typeParameter })
      expect(mockSigner.getEventsByEventHandle).toHaveBeenCalledWith(
        account,
        `${eventHandle}<${typeParameter}>`,
        fieldName,
        undefined,
      )
    })
    it('generated getter can call with query', () => {
      const query = { limit: 20, start: BigInt(100) }

      const call = generateEventsGetter(mockSigner, eventHandle, fieldName)
      call(account, { query })
      expect(mockSigner.getEventsByEventHandle).toHaveBeenCalledWith(
        account,
        eventHandle,
        fieldName,
        query,
      )
    })
  })

  describe('defineReadOnly', () => {
    const obj: any = {}
    const name = 'readonly'
    const value = () => {}

    defineReadOnly(obj, name, value)

    it('defined properties should be readonly', () => {
      expect(typeof obj[name] === 'function').toBeTruthy()
      const overwrite = () => {
        obj[name] = 'overwritten'
      }
      expect(overwrite).toThrowError()
      expect(obj[name]).toBe(value)
    })
    it('defined properties should be enumerable', () => {
      const entries = Object.entries(obj)
      expect(entries).toHaveLength(1)
      expect(entries[0][0]).toBe(name)
      expect(entries[0][1]).toBe(value)
    })
  })
  describe('parseMoveModule', () => {
    const parsed = parseMoveModule(MOCK_ABI)
    it('can parse moduleId', () => {
      expect(parsed.moduleId).toBe(`${MOCK_ABI.address}::${MOCK_ABI.name}`)
    })
    it('can extract the name of entry functions', () => {
      expect(parsed.entryFunctionNames).toHaveLength(1)
      expect(parsed.entryFunctionNames[0]).toBe('transfer')
    })
    it('can extract the name of structs which has the "key" ability', () => {
      expect(parsed.keyStructNames).toHaveLength(2)
      expect(parsed.keyStructNames[0]).toBe('CoinInfo')
      expect(parsed.keyStructNames[1]).toBe('CoinStore')
    })
    it('can extract the events', () => {
      expect(parsed.eventHandles).toHaveLength(2)
      expect(parsed.eventHandles[0].fieldName).toBe('deposit_events')
      expect(parsed.eventHandles[0].eventHandle).toBe('0x1::coin::CoinStore')
      expect(parsed.eventHandles[1].fieldName).toBe('withdraw_events')
      expect(parsed.eventHandles[1].eventHandle).toBe('0x1::coin::CoinStore')
    })
  })
  describe('throwSignerRequired', () => {
    it('should throw error', () => {
      expect(throwSignerRequired).toThrowError()
    })
  })
  describe('throwAccountResourceGetterRequired', () => {
    it('should throw error', () => {
      expect(throwAccountResourceGetterRequired).toThrowError()
    })
  })
  describe('throwEventsGetterRequired', () => {
    it('should throw error', () => {
      expect(throwEventsGetterRequired).toThrowError()
    })
  })
})
