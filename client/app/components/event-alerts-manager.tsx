import { type FC } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { eventAlertsAtom, removeEventAlertAtom } from "~/store";
import { EventAlert } from "./event-alert";

export const EventAlertsManager: FC = () => {
  const alerts = useAtomValue(eventAlertsAtom);
  const removeAlert = useSetAtom(removeEventAlertAtom);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed w-full bottom-44 left-0 z-40 pointer-events-none">
      {alerts.map((alert) => (
        <EventAlert key={alert.id} alert={alert} onRemove={removeAlert} />
      ))}
    </div>
  );
};
