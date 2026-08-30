import { ELEMENTS_BY_NUMBER } from "../data/elements";
import type { WrongPick } from "../game/useGame";
import { formatAnswer } from "../game/modes";

export function WrongPickToast({ pick }: { pick: WrongPick | null }) {
  if (!pick) return null;
  if (pick.text) {
    return (
      <div key={pick.id} className="wrong-pick-toast" role="status">
        <span>Not</span>
        <strong>{pick.text}</strong>
      </div>
    );
  }
  const element = ELEMENTS_BY_NUMBER.get(pick.atomicNumber);
  if (!element) return null;

  return (
    <div key={pick.id} className="wrong-pick-toast" role="status">
      <span>You clicked</span>
      <strong>{formatAnswer(element)}</strong>
    </div>
  );
}
