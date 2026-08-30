import { useEffect, useId, useState } from "react";
import type { ChemicalElement } from "../data/elements";

interface TypeAnswerFormProps {
  target: ChemicalElement;
  disabled: boolean;
  questionId: number;
  onSubmit: (value: string) => void;
}

export function TypeAnswerForm({ target, disabled, questionId, onSubmit }: TypeAnswerFormProps) {
  const [value, setValue] = useState("");
  const fieldId = useId();

  useEffect(() => {
    setValue("");
  }, [questionId]);

  return (
    <form
      className="type-answer"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        onSubmit(value);
        setValue("");
      }}
    >
      <p className="type-answer-clue" aria-hidden="true">
        <span className="type-answer-number">{target.atomicNumber}</span>
        <span className="type-answer-symbol">{target.symbol}</span>
      </p>
      <label htmlFor={fieldId}>Element name</label>
      <div className="type-answer-row">
        <input
          id={fieldId}
          type="text"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
        />
        <button type="submit" className="play-button" disabled={disabled}>
          Check
        </button>
      </div>
    </form>
  );
}
