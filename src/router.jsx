import BudgetTrackerApp from "./App";
import SpeechToText from "./components/ui/speech-to-text";

export const Router = () => {
  if (location.pathname === "/voice") {
    return <SpeechToText />;
  }
  return <BudgetTrackerApp />;
};
