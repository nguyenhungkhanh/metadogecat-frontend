import React from 'react'
import { getBscScanLink } from 'utils'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import truncateHash from 'utils/truncateHash'

interface DescriptionWithTxProps {
  description?: string
  txHash?: string
}

const DescriptionWithTx: React.FC<DescriptionWithTxProps> = ({ txHash, children }) => {
  const { chainId } = useActiveWeb3React()

  return (
    <>
      {typeof children === 'string' ? <p>{children}</p> : children}
      {txHash && (
        <a target="_blank" rel="noreferrer" href={getBscScanLink(txHash, 'transaction', chainId)}>
          View on BscScan: {truncateHash(txHash, 8, 0)}
        </a>
      )}
    </>
  )
}

export default DescriptionWithTx
