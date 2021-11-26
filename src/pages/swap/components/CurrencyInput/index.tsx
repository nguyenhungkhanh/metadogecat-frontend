import React from "react";
import { Currency } from "@pancakeswap/sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useCurrencyBalance } from "state/wallet/hooks";
import ModalSelectCurrency from 'components/ModalSelectCurrency';

import useModal from "hooks/useModal";

import styles from './index.module.scss'

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  onMax?: () => void
  showMaxButton?: boolean
  label?: string
  currency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
}

export default function CurrencyInput({
  value,
  onChange,
  onMax,
  showMaxButton,
  label,
  currency,
  onCurrencySelect
}: CurrencyInputProps) {
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined
  );

  const [onPresentModal] = useModal(
    <ModalSelectCurrency 
      onCurrencySelect={onCurrencySelect}
    />,
  )

  const handleOnChange = (event: any) => {
    onChange(event.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <div className="flex justify-between">
        <div>{label}</div>
        {
          account && currency
          ? <div>
              Balance: {selectedCurrencyBalance?.toSignificant(6) ?? "Loading"}
            </div>
          : null
        }
      </div>
      <div className="wrapper-input flex items-center">
        <input
          className="flex-1 py-2 px-3 w-full"
          value={value}
          onChange={handleOnChange}
          placeholder="0.0"
          type="number"
          min={0}
        />
        <div className="flex">
          {
            showMaxButton
            ? <div onClick={onMax} className="flex items-center text-xs text-success pointer">
                <button className="btn-max">MAX</button>
              </div>
            : null
          }
          <div onClick={onPresentModal} className="pointer px-2 font-medium">{ currency?.symbol || 'Select a currency' }</div>
        </div>
      </div>
    </div>
  );
}
