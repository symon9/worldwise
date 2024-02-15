import { useContext } from "react";
import { CitiesContext } from "../contexts/CitiesContext";

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("Error: CitiesContext context was used outside provider");
  return context;
}
export { useCities };
