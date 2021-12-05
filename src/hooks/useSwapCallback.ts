import { useMemo} from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@pancakeswap/sdk'
import { useGasPrice } from 'state/user/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { calculateGasMargin, getRouterContract } from 'utils'
import isZero from 'utils/isZero'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from 'configs/contants'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId || !deadline) return []

    const contract: Contract | null = getRouterContract(chainId, library, account)

    if (!contract) return []

    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient: account,
        deadline: deadline.toNumber(),
      }),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient: account,
          deadline: deadline.toNumber(),
        }),
      )
    }

    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const gasPrice = useGasPrice()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage)

  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }

    if (!account) {
      return { state: SwapCallbackState.LOADING, callback: null, error: null }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map((call) => {
            const { parameters: { methodName, args, value }, contract } = call
            const options = !value || isZero(value) ? {} : { value }

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return { call, gasEstimate }
              })
              .catch(async (gasError) => {
                console.error('Gas estimate failed, trying eth_call to extract error', call)
                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.error('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch((callError) => {
                    console.error('Call threw error', call, callError)
                    const reason: string = callError.reason || callError.data?.message || callError.message
                    const errorMessage = `The transaction cannot succeed due to error: ${
                      reason ?? 'Unknown error, check the logs'
                    }.`

                    return { call, error: new Error(errorMessage) }
                  })
              })
          }),
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const { call: { contract, parameters: { methodName, args, value } },  gasEstimate } = successfulEstimation

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          gasPrice,
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient = base

            addTransaction(response, {
              summary: withRecipient,
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [trade, library, account, chainId, swapCalls, gasPrice, addTransaction])
}

async function tryEstimateSlippage(
  recipient: any,
  slippage: any,
  deadline: any,
  trade: Trade | undefined,
  contract: Contract
) {
  if (!trade) return null;

  try {
    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(slippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber(),
      }),
    )
  
    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(slippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber(),
        }),
      )
    }
  
    const swapCalls = swapMethods.map((parameters) => ({ parameters, contract }))
  
    const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
      swapCalls.map(async (call: any) => {
        const { parameters: { methodName, args, value }, contract } = call
        const options = !value || isZero(value) ? {} : { value }
  
        const gasEstimate = await contract.estimateGas[methodName](...args, options)
        if (gasEstimate) {
          return { call, gasEstimate}
        }
        return { call, error: Error('Invalid slippage') }
      })
    )

    return estimatedCalls.find((el, ix, list): el is SuccessfulCall => {
      return 'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
    });
  } catch (error) {
    return null
  }
}

export async function getSlippage(account: any, chainId: number | undefined, library: any, deadline: any, trade: Trade | undefined) {
  try {
    if (!trade || !library || !account || !chainId || !deadline) return 0

    const contract: Contract | null = getRouterContract(chainId, library, account)
  
    if (!contract) return 0
  
    const STEP = 50;
  
    let slippage = null;
  
    for (let _slippage = 0; _slippage < 5000; _slippage += STEP) {
      const result = await tryEstimateSlippage(account, _slippage, deadline, trade, contract)
      if (result) {
        slippage = _slippage
        break
      }
    }
  
    return slippage  
  } catch (error) {
    return null
  }
}