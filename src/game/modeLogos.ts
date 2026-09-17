import nameLogo from "../assets/modes/name.png";
import numberLogo from "../assets/modes/number.png";
import propertiesLogo from "../assets/modes/properties.png";
import mixedLogo from "../assets/modes/mixed.png";
import symbolLogo from "../assets/modes/symbol.png";
import typeLogo from "../assets/modes/type.png";

export const MODE_LOGOS: Record<string, string> = {
  "find-element": nameLogo,
  "atomic-number": numberLogo,
  symbol: symbolLogo,
  properties: propertiesLogo,
  "type-name": typeLogo,
  mixed: mixedLogo,
};
