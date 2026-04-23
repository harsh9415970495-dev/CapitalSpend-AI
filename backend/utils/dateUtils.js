// Format date for display
const formatDate = (date) => {
  if (!date) return 'Invalid Date';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy format
};

// Format date for API responses
const formatDateAPI = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return d.toISOString().split('T'); // yyyy-mm-dd
};

module.exports = {
  formatDate,
  formatDateAPI
};