const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateExpense = (amount, category) => {
  if (!amount || amount <= 0) return false;
  if (!['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other', 'Others'].includes(category)) {
    return false;
  }

  return true;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateExpense,
};