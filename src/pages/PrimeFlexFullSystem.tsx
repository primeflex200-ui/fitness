import React from "react";
import AdminPanel from "./AdminPanel";

// Lightweight wrapper that re-uses the existing AdminPanel.
// This keeps the route `/prime-flex-full-system` working and avoids
// duplicate code while the full unified component is iterated on.
const PrimeFlexFullSystem: React.FC = () => {
	return <AdminPanel />;
};

export default PrimeFlexFullSystem;

