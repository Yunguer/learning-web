const { exec } = require("node:child_process");
const dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let dotCount = 0;

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      dotCount = (dotCount + 1) % dots.length;
      process.stdout.write(
        `\r⏳ Aguardando Postgres Aceitar Conexões ${dots[dotCount]} `,
      );
      checkPostgres();
      return;
    }

    console.log("✅ Postgres Está Aceitando Conexões\n");
  }
}

checkPostgres();
