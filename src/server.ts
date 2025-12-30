import app from "./app";
import "dotenv/config";
import './database/connection';

const PORT = process.env.PORT_API_CONTROLE || 2010;

app.listen(PORT, () => {
  console.log(`API Controle rodando na porta ${PORT}`);
});
