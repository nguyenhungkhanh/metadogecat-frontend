import { useEffect, useMemo, useState } from 'react'
import { Token, TokenAmount } from '@pancakeswap/sdk'
import { useTokenContract } from 'hooks/useContract'

function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const [allowance, setAllowance] = useState<TokenAmount | undefined>(undefined)
  const contract = useTokenContract(token?.address, false)

  useEffect(() => {
    async function getAllowance() {
      if (contract) {
        const _allowance = await contract.allowance(owner, spender)
        if (_allowance) {
          setAllowance(_allowance)
        }
      }
    }
    getAllowance()
  }, [contract, owner, spender])

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  )
}

export default useTokenAllowance
