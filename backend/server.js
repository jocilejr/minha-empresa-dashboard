const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
      [req.user.id, 'admin']
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Requer permissão de administrador.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

// Receive payment webhook
app.post('/webhook/v1/receive-payment', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const { event, type, external_id, amount, status, customer_name, customer_phone, customer_email, customer_document, boleto_url } = payload;

    // Validate required fields
    if (!type || amount === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, amount' });
    }

    // Validate type
    const validTypes = ['boleto', 'pix', 'cartao'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: boleto, pix, cartao' });
    }

    // Validate status if provided
    const validStatuses = ['gerado', 'pago', 'pendente', 'cancelado', 'expirado'];
    const paymentStatus = status && validStatuses.includes(status) ? status : 'pendente';

    // Check if transaction with external_id exists (for updates)
    if (external_id && (event === 'payment.updated' || event === 'payment.status_changed')) {
      const existingTransaction = await pool.query(
        'SELECT id FROM transactions WHERE external_id = $1',
        [external_id]
      );

      if (existingTransaction.rows.length > 0) {
        // Update existing transaction
        await pool.query(
          `UPDATE transactions SET 
            status = $1, 
            amount = COALESCE($2, amount),
            customer_name = COALESCE($3, customer_name),
            customer_phone = COALESCE($4, customer_phone),
            customer_email = COALESCE($5, customer_email),
            customer_document = COALESCE($6, customer_document),
            boleto_url = COALESCE($7, boleto_url),
            event = $8,
            raw_payload = $9,
            updated_at = NOW()
          WHERE external_id = $10`,
          [paymentStatus, amount, customer_name, customer_phone, customer_email, customer_document, boleto_url, event, payload, external_id]
        );

        console.log('Transaction updated:', external_id);
        return res.status(200).json({ success: true, message: 'Transação atualizada', external_id });
      }
    }

    // Insert new transaction
    const result = await pool.query(
      `INSERT INTO transactions (external_id, type, amount, status, customer_name, customer_phone, customer_email, customer_document, boleto_url, event, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [external_id, type, amount, paymentStatus, customer_name, customer_phone, customer_email, customer_document, boleto_url, event, payload]
    );

    console.log('Transaction created:', result.rows[0].id);
    res.status(201).json({ success: true, message: 'Transação criada', id: result.rows[0].id });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// ============================================
// TRANSACTION ENDPOINTS
// ============================================

// List transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { status, type, date_from, date_to, search, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (date_from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    if (search) {
      query += ` AND (customer_name ILIKE $${paramIndex} OR customer_email ILIKE $${paramIndex} OR customer_phone ILIKE $${paramIndex} OR external_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get counts for each status
    const countsResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pago') as approved,
        COUNT(*) FILTER (WHERE status = 'gerado') as boleto,
        COUNT(*) FILTER (WHERE status = 'pendente') as pending,
        COUNT(*) FILTER (WHERE status IN ('cancelado', 'expirado')) as failed,
        COUNT(*) as total
      FROM transactions
    `);

    res.json({
      transactions: result.rows,
      counts: countsResult.rows[0]
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
});

// Get transaction by id
app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Get user roles
    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );
    const roles = rolesResult.rows.map(r => r.role);

    const token = jwt.sign(
      { id: user.id, username: user.username, roles },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, name, email, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [req.user.id]
    );
    const roles = rolesResult.rows.map(r => r.role);

    res.json({ ...result.rows[0], roles });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// List users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.name, u.email, u.active, u.created_at, u.last_login,
             array_agg(ur.role) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Create user (admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, email, roles } = req.body;

    // Check if username exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, name, email) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, passwordHash, name, email]
    );

    const userId = result.rows[0].id;

    // Add roles
    if (roles && roles.length > 0) {
      for (const role of roles) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
          [userId, role]
        );
      }
    }

    res.status(201).json({ id: userId, message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, active, roles } = req.body;

    // Update user info
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET name = $1, email = $2, password_hash = $3, active = $4 WHERE id = $5',
        [name, email, passwordHash, active, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = $1, email = $2, active = $3 WHERE id = $4',
        [name, email, active, id]
      );
    }

    // Update roles
    if (roles) {
      await pool.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      for (const role of roles) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
          [id, role]
        );
      }
    }

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Initialize admin user on startup
const initializeAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [adminUsername]
    );

    if (existingAdmin.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const result = await pool.query(
        'INSERT INTO users (username, password_hash, name, email) VALUES ($1, $2, $3, $4) RETURNING id',
        [adminUsername, passwordHash, 'Administrador', 'admin@origemviva.com']
      );

      await pool.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [result.rows[0].id, 'admin']
      );

      console.log(`Admin user created: ${adminUsername}`);
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`API running on port ${PORT}`);
  await initializeAdmin();
});
