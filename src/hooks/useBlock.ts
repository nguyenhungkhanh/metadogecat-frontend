import { useEffect, useRef, useState } from "react"
import { simpleRpcProvider } from "utils/providers"
import useIsWindowVisible from "./useIsWindowVisible"
import usePreviousValue from "./usePreviousValue"

function useBlock(refreshTime = 3000) {
  const timer = useRef<any>(null)
  const [currentBlock, setCurrentBlock] = useState<number | undefined>(undefined)
  const previousBlock = usePreviousValue(currentBlock)

  const isWindowVisible = useIsWindowVisible()

  useEffect(() => {
    if (isWindowVisible) {
      timer.current = setInterval(async () => {
        const blockNumber = await simpleRpcProvider.getBlockNumber()
        setCurrentBlock(blockNumber)
      }, refreshTime)
    } else {
      clearInterval(timer.current)
    }

    return () => clearInterval(timer.current)
  }, [timer, isWindowVisible, refreshTime])

  return {
    currentBlock,
    previousBlock
  }
}

export default useBlock