cronAdd("cleanup_presence", "*/1 * * * *", () => {
  const threshold = new Date(Date.now() - 60000).toISOString();

  try {
    $app
      .db()
      .newQuery(
        `
        DELETE FROM presence
        WHERE lastSeen < {:expiry}
      `
      )
      .bind({ expiry: threshold })
      .execute();
  } catch (e) {
    $app.logger().error("清理失败", "msg", e.message);
  }
});
