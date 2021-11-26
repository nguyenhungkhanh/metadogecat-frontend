import React from "react";
import styles from './index.module.scss'

export default function SlippageInput({ allowedSlippage, setAllowedSlippage }: { allowedSlippage: number, setAllowedSlippage: (slippage: number) => void }) {
  const value = allowedSlippage ? allowedSlippage : ""
  return (
    <div className={styles.wrapper}>
      <div>Slippage</div>
      <div className="wrapper-input rounded-sm flex items-center">
        <input 
          className="flex-1 py-2 px-3 w-full"
          value={value}
          placeholder="0.5"
          onChange={(event: any) => {
            console.log(event.target.value)
            setAllowedSlippage(Number(event.target.value))
          }}
        />
        <span className="pr-3 percent-symbol">%</span>
        <button className="rounded-sm px-5">
          Auto
        </button>
      </div>
    </div>
  )
}