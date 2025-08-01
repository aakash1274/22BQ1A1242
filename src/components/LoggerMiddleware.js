const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
export function logAction(event, details = {}) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    event,
    ...details,
  };
  logs.push(entry);

  localStorage.setItem('appLogs', JSON.stringify(logs));
}

export function getLogs() {
  return JSON.parse(localStorage.getItem('appLogs') || '[]');
}
