export function getStatusColor(s) { 
    const status = String(s).toLowerCase().trim();
    if (status === "on" || status === "увімкнено") return "#22c55e"; 
    if (status === "off" || status === "вимкнено") return "#3b82f6"; 
    return "#f59e0b"; 
}
