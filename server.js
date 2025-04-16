const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Inicializar o app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'src')));

// Garantir que o diretório de uploads exista
const uploadDir = path.join(__dirname, 'src/assets/images/uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('Criando diretório de uploads:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/assets/images/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

// Inicializar tabelas no banco de dados
function initializeDatabase() {
  // Tabela de usuários (administradores)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de imóveis
  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    property_type TEXT NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    area INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    parking_spaces INTEGER,
    suites INTEGER,
    furnished TEXT,
    description TEXT,
    featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de comodidades dos imóveis
  db.run(`CREATE TABLE IF NOT EXISTS property_amenities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    name TEXT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
  )`);

  // Tabela de imagens dos imóveis
  db.run(`CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT 0,
    FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
  )`);

  // Tabela para vídeos dos imóveis
  db.run(`CREATE TABLE IF NOT EXISTS property_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    video_url TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
  )`);

  // Tabela de contatos
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    property_id INTEGER,
    status TEXT DEFAULT 'novo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties (id)
  )`);

  // Criar usuário admin padrão se não existir
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (!row) {
      // Hash da senha 'admin123'
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('admin123', salt);
      
      // Insere o usuário admin
      db.run(
        "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)",
        ['admin', hash, 'Administrador', 'admin@versare.com.br', 'admin'],
        function(err) {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Usuário admin criado com sucesso!');
          }
        }
      );
    }
  });

  // Inserir imóveis de exemplo se tabela estiver vazia
  db.get("SELECT COUNT(*) as count FROM properties", (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      // Inserir dados de exemplo
      insertSampleData();
    }
  });

  // Criar tabela de configurações
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function insertSampleData() {
  // Array com dados de exemplo de imóveis
  const sampleProperties = [
    {
      code: 'VSR001',
      title: 'Apartamento de Luxo no Jardim Paulista',
      type: 'venda',
      property_type: 'apartamento',
      price: 950000,
      status: 'ativo',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking_spaces: 2,
      suites: 1,
      furnished: 'não',
      description: 'Lindo apartamento em localização privilegiada no Jardim Paulista, próximo a restaurantes, comércios e áreas verdes.',
      featured: 1
    },
    {
      code: 'VSR002',
      title: 'Cobertura Duplex com Vista Panorâmica',
      type: 'aluguel',
      property_type: 'cobertura',
      price: 8500,
      status: 'ativo',
      neighborhood: 'Moema',
      city: 'São Paulo',
      area: 200,
      bedrooms: 4,
      bathrooms: 3,
      parking_spaces: 3,
      suites: 2,
      furnished: 'sim',
      description: 'Cobertura duplex com vista panorâmica para o bairro de Moema. Amplo terraço com churrasqueira.',
      featured: 1
    },
    {
      code: 'VSR003',
      title: 'Casa em Condomínio com Área de Lazer',
      type: 'venda',
      property_type: 'casa',
      price: 1250000,
      status: 'ativo',
      neighborhood: 'Morumbi',
      city: 'São Paulo',
      area: 300,
      bedrooms: 4,
      bathrooms: 3,
      parking_spaces: 4,
      suites: 2,
      furnished: 'não',
      description: 'Casa espaçosa em condomínio fechado com área de lazer completa e segurança 24h.',
      featured: 1
    },
    {
      code: 'VSR004',
      title: 'Residencial Villa Moderna - Pronto para Morar',
      type: 'lancamento',
      property_type: 'apartamento',
      price: 650000,
      status: 'ativo',
      neighborhood: 'Brooklin',
      city: 'São Paulo',
      area: 90,
      bedrooms: 2,
      bathrooms: 2,
      parking_spaces: 1,
      suites: 1,
      furnished: 'não',
      description: 'Empreendimento recém lançado com ótimas opções de lazer e localização privilegiada no Brooklin.',
      featured: 1
    },
    {
      code: 'VSR005',
      title: 'Escritório Comercial de Alto Padrão',
      type: 'aluguel',
      property_type: 'comercial',
      price: 12000,
      status: 'inativo',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      area: 180,
      bedrooms: 0,
      bathrooms: 2,
      parking_spaces: 3,
      suites: 0,
      furnished: 'não',
      description: 'Escritório de alto padrão em prédio comercial com serviços completos no Itaim Bibi.',
      featured: 1
    },
    {
      code: 'VSR006',
      title: 'Apartamento Garden com Área Verde Privativa',
      type: 'venda',
      property_type: 'apartamento',
      price: 875000,
      status: 'vendido',
      neighborhood: 'Perdizes',
      city: 'São Paulo',
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      parking_spaces: 2,
      suites: 1,
      furnished: 'não',
      description: 'Apartamento garden com área verde privativa em condomínio com infraestrutura completa.',
      featured: 1
    }
  ];

  // Inserir os imóveis de exemplo
  const insertPropertyStmt = db.prepare(`
    INSERT INTO properties (
      code, title, type, property_type, price, status, neighborhood, city, 
      area, bedrooms, bathrooms, parking_spaces, suites, furnished, description, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleProperties.forEach(property => {
    insertPropertyStmt.run(
      property.code, property.title, property.type, property.property_type, 
      property.price, property.status, property.neighborhood, property.city,
      property.area, property.bedrooms, property.bathrooms, property.parking_spaces,
      property.suites, property.furnished, property.description, property.featured
    );
  });

  insertPropertyStmt.finalize();
  console.log('Dados de exemplo inseridos com sucesso!');
}

// Rotas para o site principal

// Rota para obter imóveis em destaque
app.get('/api/properties/featured', (req, res) => {
  db.all('SELECT * FROM properties WHERE featured = 1 AND status = "ativo" LIMIT 6', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para obter todos os imóveis com filtros
app.get('/api/properties', (req, res) => {
  let query = 'SELECT * FROM properties WHERE 1=1';
  const params = [];

  // Adicionar filtros dinâmicos
  if (req.query.type) {
    query += ' AND type = ?';
    params.push(req.query.type);
  }
  
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  
  if (req.query.city) {
    query += ' AND city = ?';
    params.push(req.query.city);
  }
  
  if (req.query.neighborhood) {
    query += ' AND neighborhood = ?';
    params.push(req.query.neighborhood);
  }
  
  if (req.query.min_price) {
    query += ' AND price >= ?';
    params.push(req.query.min_price);
  }
  
  if (req.query.max_price) {
    query += ' AND price <= ?';
    params.push(req.query.max_price);
  }
  
  // Organizar por mais recentes
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para obter detalhes de um imóvel específico
app.get('/api/properties/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM properties WHERE id = ?', [id], (err, property) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!property) {
      return res.status(404).json({ error: 'Imóvel não encontrado' });
    }
    
    // Buscar as comodidades do imóvel
    db.all('SELECT name FROM property_amenities WHERE property_id = ?', [id], (err, amenities) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Buscar as imagens do imóvel
      db.all('SELECT * FROM property_images WHERE property_id = ?', [id], (err, images) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Buscar os vídeos do imóvel
        db.all('SELECT * FROM property_videos WHERE property_id = ?', [id], (err, videos) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Retornar os dados completos do imóvel
          res.json({
            ...property,
            amenities: amenities.map(a => a.name),
            images: images,
            videos: videos
          });
        });
      });
    });
  });
});

// Rota para enviar contato
app.post('/api/contacts', (req, res) => {
  const { name, email, phone, message, property_id } = req.body;
  
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const sql = `
    INSERT INTO contacts (name, email, phone, message, property_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [name, email, phone, message, property_id || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      id: this.lastID,
      success: true,
      message: 'Contato enviado com sucesso!'
    });
  });
});

// Rotas para o painel administrativo

// Autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
  }
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    const isValid = bcrypt.compareSync(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Remover a senha do objeto usuário antes de enviar
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      success: true
    });
  });
});

// Rota para listar todos os imóveis (admin)
app.get('/api/admin/properties', (req, res) => {
  db.all('SELECT * FROM properties ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para adicionar um novo imóvel
app.post('/api/admin/properties', (req, res) => {
  const {
    code, title, type, property_type, price, status, neighborhood, city,
    address, postal_code, area, bedrooms, bathrooms, parking_spaces,
    suites, furnished, description, featured, amenities
  } = req.body;
  
  // Validar campos obrigatórios
  if (!code || !title || !type || !property_type || !price || !status || !neighborhood || !city) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  
  // Verificar se já existe um imóvel com o mesmo código
  db.get('SELECT id FROM properties WHERE code = ?', [code], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      return res.status(400).json({ error: 'Já existe um imóvel com este código' });
    }
    
    // Inserir o novo imóvel
    const sql = `
      INSERT INTO properties (
        code, title, type, property_type, price, status, neighborhood, city,
        address, postal_code, area, bedrooms, bathrooms, parking_spaces,
        suites, furnished, description, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [
        code, title, type, property_type, price, status, neighborhood, city,
        address, postal_code, area, bedrooms, bathrooms, parking_spaces,
        suites, furnished, description, featured || 0
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const propertyId = this.lastID;
        
        // Se houver comodidades, inseri-las
        if (amenities && amenities.length > 0) {
          const insertAmenityStmt = db.prepare('INSERT INTO property_amenities (property_id, name) VALUES (?, ?)');
          
          amenities.forEach(name => {
            insertAmenityStmt.run(propertyId, name);
          });
          
          insertAmenityStmt.finalize();
        }
        
        res.json({
          id: propertyId,
          success: true,
          message: 'Imóvel adicionado com sucesso!'
        });
      }
    );
  });
});

// Rota para atualizar um imóvel
app.put('/api/admin/properties/:id', (req, res) => {
  const id = req.params.id;
  const {
    title, type, property_type, price, status, neighborhood, city,
    address, postal_code, area, bedrooms, bathrooms, parking_spaces,
    suites, furnished, description, featured, amenities
  } = req.body;
  
  // Validar campos obrigatórios
  if (!title || !type || !property_type || !price || !status || !neighborhood || !city) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  
  // Atualizar o imóvel
  const sql = `
    UPDATE properties SET
      title = ?, type = ?, property_type = ?, price = ?, status = ?,
      neighborhood = ?, city = ?, address = ?, postal_code = ?, area = ?,
      bedrooms = ?, bathrooms = ?, parking_spaces = ?, suites = ?,
      furnished = ?, description = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(
    sql,
    [
      title, type, property_type, price, status, neighborhood, city,
      address, postal_code, area, bedrooms, bathrooms, parking_spaces,
      suites, furnished, description, featured || 0, id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Imóvel não encontrado' });
      }
      
      // Se houver comodidades, atualizar
      if (amenities) {
        // Remover comodidades atuais
        db.run('DELETE FROM property_amenities WHERE property_id = ?', [id], function(err) {
          if (err) {
            console.error(err.message);
          }
          
          // Inserir novas comodidades
          if (amenities.length > 0) {
            const insertAmenityStmt = db.prepare('INSERT INTO property_amenities (property_id, name) VALUES (?, ?)');
            
            amenities.forEach(name => {
              insertAmenityStmt.run(id, name);
            });
            
            insertAmenityStmt.finalize();
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Imóvel atualizado com sucesso!'
      });
    }
  );
});

// Rota para remover um imóvel
app.delete('/api/admin/properties/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Imóvel não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Imóvel removido com sucesso!'
    });
  });
});

// Upload de imagens para imóveis
app.post('/api/admin/properties/:id/images', upload.array('images', 10), (req, res) => {
  const propertyId = req.params.id;
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  
  // Verificar se o imóvel existe
  db.get('SELECT id FROM properties WHERE id = ?', [propertyId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Imóvel não encontrado' });
    }
    
    // Inserir registros de imagens no banco
    const insertImageStmt = db.prepare('INSERT INTO property_images (property_id, image_url, is_main) VALUES (?, ?, ?)');
    
    const imageRecords = [];
    
    files.forEach((file, index) => {
      const isMain = index === 0 ? 1 : 0; // Primeira imagem como principal
      const imageUrl = '/assets/images/uploads/' + file.filename;
      
      insertImageStmt.run(propertyId, imageUrl, isMain);
      imageRecords.push({ url: imageUrl, isMain });
    });
    
    insertImageStmt.finalize();
    
    res.json({
      success: true,
      message: 'Imagens enviadas com sucesso!',
      images: imageRecords
    });
  });
});

// Adicionar vídeos a um imóvel
app.post('/api/admin/properties/:id/videos', (req, res) => {
  const propertyId = req.params.id;
  
  // Log para depurar o conteúdo da requisição
  console.log('Recebendo requisição POST para vídeos:');
  console.log('Body:', JSON.stringify(req.body));
  
  try {
    const { videos } = req.body;
    
    console.log(`Recebendo requisição para adicionar vídeos ao imóvel ${propertyId}:`, videos);
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      console.log('Nenhum vídeo válido recebido');
      return res.status(400).json({ error: 'Nenhum vídeo válido enviado' });
    }
    
    // Verificar se o imóvel existe
    db.get('SELECT * FROM properties WHERE id = ?', [propertyId], (err, property) => {
      if (err) {
        console.error('Erro ao verificar imóvel:', err);
        return res.status(500).json({ error: 'Erro ao verificar imóvel' });
      }
      
      if (!property) {
        console.log(`Imóvel ${propertyId} não encontrado`);
        return res.status(404).json({ error: 'Imóvel não encontrado' });
      }
      
      // Inserir os vídeos no banco
      try {
        const insertVideoStmt = db.prepare('INSERT INTO property_videos (property_id, video_url, title) VALUES (?, ?, ?)');
        
        const videoRecords = [];
        
        videos.forEach(video => {
          if (!video || !video.url) {
            console.log('Vídeo inválido encontrado, pulando:', video);
            return;
          }
          
          console.log(`Inserindo vídeo: ${video.url} - ${video.title || 'Sem título'}`);
          insertVideoStmt.run(propertyId, video.url, video.title || '');
          videoRecords.push({ 
            video_url: video.url, 
            title: video.title || ''
          });
        });
        
        insertVideoStmt.finalize();
        
        console.log(`${videoRecords.length} vídeos adicionados com sucesso ao imóvel ${propertyId}`);
        
        res.status(200).json({
          success: true,
          message: `${videoRecords.length} vídeos adicionados com sucesso`,
          property_id: propertyId,
          videos: videoRecords
        });
      } catch (error) {
        console.error('Erro ao inserir vídeos:', error);
        res.status(500).json({ error: 'Erro ao salvar vídeos', details: error.message });
      }
    });
  } catch (error) {
    console.error('Erro ao processar requisição de vídeos:', error);
    res.status(400).json({ error: 'Erro ao processar requisição', details: error.message });
  }
});

// Remover um vídeo específico
app.delete('/api/admin/properties/:id/videos/:videoId', (req, res) => {
  const propertyId = req.params.id;
  const videoId = req.params.videoId;
  
  // Verificar se o imóvel e o vídeo existem
  db.get('SELECT * FROM property_videos WHERE id = ? AND property_id = ?', 
    [videoId, propertyId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Vídeo não encontrado para este imóvel' });
    }
    
    // Remover o vídeo
    db.run('DELETE FROM property_videos WHERE id = ?', [videoId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        success: true,
        message: 'Vídeo removido com sucesso!'
      });
    });
  });
});

// Rota para listar todos os contatos
app.get('/api/admin/contacts', (req, res) => {
  db.all(`
    SELECT c.*, p.title as property_title, p.code as property_code
    FROM contacts c
    LEFT JOIN properties p ON c.property_id = p.id
    ORDER BY c.created_at DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para atualizar status de um contato
app.put('/api/admin/contacts/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }
  
  db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Status do contato atualizado com sucesso!'
    });
  });
});

// Rota para obter todas as configurações
app.get('/api/admin/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Converter array de {key, value} para objeto
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    res.json(settings);
  });
});

// Rota para salvar configurações
app.post('/api/admin/settings', (req, res) => {
  const settings = req.body;
  
  db.run(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) 
    DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `, [], (err) => {
    if (err) {
      console.error('Erro ao inserir configurações:', err);
      return res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
    
    // Inserir/atualizar cada configuração individualmente
    Object.entries(settings).forEach(([key, value]) => {
      db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    });
    
    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  });
});

// API pública para obter configurações do site
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings WHERE key IN ("site_name", "primary_phone", "whatsapp", "primary_email", "address")', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar configurações:', err);
      return res.status(500).json({ error: 'Erro ao obter configurações' });
    }
    
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    res.json(settings);
  });
});

// Rota principal (serve o site)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Rota para o painel admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'admin', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 