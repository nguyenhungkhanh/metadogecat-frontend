import React, { useState } from "react";
import { escapeRegExp } from 'utils'
import { useUserSlippageTolerance } from "state/user/hooks";
import styles from './index.module.scss'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export default function SlippageInput({isAutoSlippage, setIsAutoSlippage }: { isAutoSlippage: boolean, setIsAutoSlippage: (_: boolean) => void }) {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  const [slippageInput, setSlippageInput] = useState('')

  const slippageInputIsValid =
    slippageInput === '' || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  
  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }
  
  const parseCustomSlippage = (value: string) => {
    if (value === '' || inputRegex.test(escapeRegExp(value))) {
      setSlippageInput(value)

      try {
        const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
        if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
          setUserSlippageTolerance(valueAsIntFromRoundedFloat)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleOnBlur = () => {
    parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
  }

  const handleOnChange = (event: any) => {
    if (event.currentTarget.validity.valid) {
      parseCustomSlippage(event.target.value.replace(/,/g, '.'))
    }
  }

  return (
    <div className={styles.wrapper}>
      <div>Slippage</div>
      <div className="wrapper-input rounded-sm flex items-center">
        <input 
          style={{ opacity: isAutoSlippage ? 0.65 : 1 }}
          readOnly={isAutoSlippage}
          className="flex-1 py-2 px-3 w-full"
          inputMode="decimal"
          pattern="^[0-9]*[.,]?[0-9]{0,2}$"
          placeholder={(userSlippageTolerance / 100).toFixed(2)}
          value={slippageInput}
          onBlur={handleOnBlur}
          onChange={handleOnChange}
          disabled={isAutoSlippage}
        />
        <span className="pr-3 percent-symbol">%</span>
        <button 
          className="rounded-sm px-5" 
          style={{ opacity: isAutoSlippage ? 0.65 : 1 }} 
          onClick={() => setIsAutoSlippage(!isAutoSlippage)}
        >
          Auto
        </button>
      </div>
      {!!slippageError && (
          <span className="slippage-error mt" style={{ color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E' }}>
            {
              slippageError === SlippageError.InvalidInput
                ? 'Enter a valid slippage percentage'
                : slippageError === SlippageError.RiskyLow
                  ? 'Your transaction may fail'
                  : 'Your transaction may be frontrun'
            }
          </span>
        )}
    </div>
  )
}