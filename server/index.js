const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Limite aumentado para dados grandes

// Inicializa o arquivo de banco de dados se não existir
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    orders: {},
    customers: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helpers para ler e escrever
const readData = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler banco de dados:', err);
    return { orders: {}, customers: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Erro ao escrever no banco de dados:', err);
    return false;
  }
};

// Rotas
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/save', (req, res) => {
  const { orders, customers } = req.body;
  
  // Lê o estado atual para não perder dados se enviar parcial (opcional, aqui substituiremos tudo pela simplicidade do frontend atual)
  const currentData = readData();
  
  const newData = {
    orders: orders !== undefined ? orders : currentData.orders,
    customers: customers !== undefined ? customers : currentData.customers
  };

  if (writeData(newData)) {
    res.json({ success: true, message: 'Dados salvos com sucesso' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao salvar dados' });
  }
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const CORRECT_PASS = "S600ad";
  
  if (password === CORRECT_PASS) {
    res.json({ success: true, token: 'session-token-123' });
  } else {
    res.status(401).json({ success: false, message: 'Senha incorreta' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Dados sendo salvos em: ${DB_FILE}`);
});