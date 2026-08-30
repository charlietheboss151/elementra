import { CATEGORIES, CATEGORY_EXPLAINERS, CATEGORY_LABELS } from "../data/elements";

export function CategoryLegend() {
  return (
    <ul className="legend">
      {CATEGORIES.map((category) => (
        <li key={category} className="legend-item has-tip" tabIndex={0} aria-describedby={`legend-tip-${category}`}>
          <span className={`legend-swatch tile--${category}`} />
          {CATEGORY_LABELS[category]}
          <span id={`legend-tip-${category}`} role="tooltip" className="tip">
            {CATEGORY_EXPLAINERS[category]}
          </span>
        </li>
      ))}
    </ul>
  );
}
