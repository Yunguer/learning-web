const { exec } = require("node:child_process");
const dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let dotCount = 0;

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout, stderr) {
    if (stdout.search("accepting connections") === -1) {
      dotCount = (dotCount + 1) % dots.length;
      process.stdout.write(
        `\r⏳ Aguardando Postgres Aceitar Conexões ${dots[dotCount]} `,
      );
      checkPostgres();
      return;
    }

    process.stdout.write(`\r⏳ Aguardando Postgres Aceitar Conexões ⠿`);
    console.log("\n✅ Postgres Está Aceitando Conexões\n");
  }
}

checkPostgres();
