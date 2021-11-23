import React from "react";
import { Currency } from "@pancakeswap/sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useCurrencyBalance } from "state/wallet/hooks";
import ModalSelectCurrency from './ModalSelectCurrency';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onMax?: () => void;
  showMaxButton?: boolean;
  label?: string;
  currency?: Currency | null;
}

export default function CurrencyInput({
  value,
  onChange,
  onMax,
  showMaxButton,
  label,
  currency,
}: CurrencyInputProps) {
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined
  );

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
        <div className="px-2">{ currency?.symbol || 'Select a currency' }</div>
      </div>
      <ModalSelectCurrency />
    </div>
  );
}
