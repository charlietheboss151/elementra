import { CATEGORIES, CATEGORY_LABELS } from "../data/elements";

export function CategoryLegend() {
  return (
    <ul className="legend">
      {CATEGORIES.map((category) => (
        <li key={category}>
          <span className={`legend-swatch tile--${category}`} />
          {CATEGORY_LABELS[category]}
        </li>
      ))}
    </ul>
  );
}
