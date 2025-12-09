test("GET to /api/v1/status should return 200", async () => {
  const reponse = await fetch("http://localhost:3000/api/v1/status");
  expect(reponse.status).toBe(200);
});
