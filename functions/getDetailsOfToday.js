const getDetailsOfTodays = () => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return { startOfToday, endOfToday };
};

module.exports = getDetailsOfTodays;
