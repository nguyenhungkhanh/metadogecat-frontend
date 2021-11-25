import React from "react";
import { Currency } from "@pancakeswap/sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useCurrencyBalance } from "state/wallet/hooks";
import ModalSelectCurrency from 'components/ModalSelectCurrency';

import useModal from "hooks/useModal";

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
    <div className="shadow border rounded bg-white">
      <div className="flex justify-between">
        <div>{label}</div>
        <div>
          Balance: {selectedCurrencyBalance?.toSignificant(6) ?? "Loading"}
        </div>
      </div>
      <div className="flex items-center">
        <input
          className="flex-1 appearance-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="from"
          value={value}
          onChange={handleOnChange}
          placeholder="0.0"
        />
        <div className="flex">
          {
            showMaxButton
            ? <div onClick={onMax}>MAX</div>
            : null
          }
          <div onClick={onPresentModal} className="px-2">{ currency?.symbol || 'Select a currency' }</div>
        </div>
      </div>
    </div>
  );
}
