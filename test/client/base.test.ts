import { AptosClient } from 'aptos'
import { AptosModuleClient, AptosSigner } from 'src'
import { MOCK_ABI, MOCK_ABI_MINIFIED } from '../__mocks__/abi'

describe('MoveModuleClient', () => {
  const cases = [
    { name: 'ABI', abi: MOCK_ABI },
    { name: 'ABI Minified', abi: MOCK_ABI_MINIFIED },
  ]
  cases.forEach(({ name, abi }) => {
    describe(name, () => {
      const moduleId = `${abi.address}::${abi.name}`
      const expectedFunctions = ['transfer']
      const expectedResourceGetters = ['getCoinInfo', 'getCoinStore']
      const expectedEventsGetters = [
        {
          name: 'getDepositEvents',
          eventHandle: '0x1::coin::CoinStore',
          fieldName: 'deposit_events',
        },
        {
          name: 'getWithdrawEvents',
          eventHandle: '0x1::coin::CoinStore',
          fieldName: 'withdraw_events',
        },
      ]

      const account = '0x2'
      describe('signer', () => {
        it('can create instance from ABI and signer', () => {
          let mockSigner: AptosSigner = {
            signAndSubmitTransaction: jest.fn(),
            getAccountResource: jest.fn(),
            getEventsByEventHandle: jest.fn(),
          }
          const module: any = new AptosModuleClient(abi, mockSigner)

          expect(module.signerOrClient).toBe(mockSigner)
          expectedFunctions.forEach((fn) => {
            module[fn]()
            expect(
              mockSigner.signAndSubmitTransaction,
            ).toHaveBeenLastCalledWith(
              {
                type: 'entry_function_payload',
                function: `${moduleId}::${fn}`,
                type_arguments: [],
                arguments: [],
              },
              undefined,
            )
          })
          expectedResourceGetters.forEach((getter) => {
            module[getter](account)
            expect(mockSigner.getAccountResource).toHaveBeenLastCalledWith(
              account,
              `${moduleId}::${getter.replace('get', '')}`,
            )
          })
          expectedEventsGetters.forEach((getter) => {
            module[getter.name](account)
            expect(mockSigner.getEventsByEventHandle).toHaveBeenLastCalledWith(
              account,
              getter.eventHandle,
              getter.fieldName,
              undefined,
            )
          })
        })
        it('can create instance with passed address', () => {
          let mockSigner: AptosSigner = {
            signAndSubmitTransaction: jest.fn(),
          }
          const address = '0x9'
          const module: any = new AptosModuleClient(abi, mockSigner, address)
          expect(module.signerOrClient).toBe(mockSigner)
          expectedFunctions.forEach((fn) => {
            module[fn]()
            expect(
              mockSigner.signAndSubmitTransaction,
            ).toHaveBeenLastCalledWith(
              {
                type: 'entry_function_payload',
                function: `${address}::${abi.name}::${fn}`,
                type_arguments: [],
                arguments: [],
              },
              undefined,
            )
          })
        })
        it('if signer does not implement "getAccountResource", getters throw error', () => {
          let mockSigner: AptosSigner = {
            signAndSubmitTransaction: jest.fn(),
          }
          const module: any = new AptosModuleClient(abi, mockSigner)

          expect(module.signerOrClient).toBe(mockSigner)
          expectedResourceGetters.forEach((getter) => {
            expect(module[getter]).toThrowError()
          })
        })
        it('if signer does not implement "getEventsByHandle", getters throw error', () => {
          let mockSigner: AptosSigner = {
            signAndSubmitTransaction: jest.fn(),
          }
          const module: any = new AptosModuleClient(abi, mockSigner)

          expect(module.signerOrClient).toBe(mockSigner)
          expectedEventsGetters.forEach((getter) => {
            expect(module[getter.name]).toThrowError()
          })
        })
      })
      describe('client', () => {
        it('can create instance from ABI and client', () => {
          const client = new AptosClient('https://exmple.com')
          client.getAccountResource = jest.fn()
          client.getEventsByEventHandle = jest.fn()

          const module: any = new AptosModuleClient(abi, client)

          expect(module.signerOrClient).toBe(client)
          expectedFunctions.forEach((fn) => {
            expect(module[fn]).toThrowError()
          })
          expectedResourceGetters.forEach((getter) => {
            module[getter](account)
            expect(client.getAccountResource).toHaveBeenLastCalledWith(
              account,
              `${moduleId}::${getter.replace('get', '')}`,
            )
          })
          expectedEventsGetters.forEach((getter) => {
            module[getter.name](account)
            expect(client.getEventsByEventHandle).toHaveBeenLastCalledWith(
              account,
              getter.eventHandle,
              getter.fieldName,
              undefined,
            )
          })
        })
      })
    })
  })
})
