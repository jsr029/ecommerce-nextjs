"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface Props {
  amount: number;
  onSuccess: (paypalOrderId: string) => void;
  disabled?: boolean;
}

export default function PayPalButton({ amount, onSuccess, disabled }: Props) {
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

  if (disabled) return null;

  return (
    <div className="mt-4">
      <PayPalScriptProvider
        options={{
          clientId,
          currency: "EUR",
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
          disabled={disabled}
          createOrder={(_data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "EUR",
                    value: amount.toFixed(2),
                  },
                  description: "Commande ShopNext",
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            try {
              if (!actions.order) return;
              const details = await actions.order.capture();
              onSuccess(details.id || data.orderID);
            } catch (e) {
              console.error(e);
              setError("Erreur lors du paiement PayPal");
            }
          }}
          onError={() => setError("Erreur PayPal. Réessayez ou utilisez un autre moyen.")}
          onCancel={() => setError("Paiement annulé")}
        />
      </PayPalScriptProvider>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
      <p className="text-xs text-slate-400 mt-2">
        Mode sandbox PayPal — utilisez un compte test PayPal Sandbox.
      </p>
    </div>
  );
}
