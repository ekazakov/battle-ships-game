const statusMap = {
  idle: 0,
  loading: 1,
  error: 2,
  success: 3
};

export function compareStatuses(statusA, statusB) {
  return statusMap[statusA] - statusMap[statusB];
}
