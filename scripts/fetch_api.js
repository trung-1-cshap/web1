(async () => {
  const url = 'http://localhost:3000/api/transactions';
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(url);
      console.log('STATUS', res.status);
      const text = await res.text();
      console.log(text);
      process.exit(0);
    } catch (e) {
      console.error('retry', i, e.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error('failed to reach server');
  process.exit(1);
})();
