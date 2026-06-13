fetch('http://localhost:5000/coins/analytics/global')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
