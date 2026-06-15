export const getAppUrl = () => {
  return typeof window !== "undefined" ? window.location.origin : "";
};
