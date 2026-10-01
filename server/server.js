// ==========================================
// COMPLETE BACKEND CODE (server.js)
// ==========================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Frem5462@zod',
  database: process.env.DB_NAME || 'earn_plaza',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_app_password'
  }
});

// --- MIDDLEWARES ---

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No valid token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore token errors for public queries
    }
  }
  next();
};

const verifyAdmin = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify admin status.' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 1. Generate unique referral code for the NEW user (e.g. john1234)
    const myReferralCode = name.toLowerCase().replace(/\s+/g, '') + Math.floor(1000 + Math.random() * 9000);

    // 2. Check if the user signed up using someone else's referral code
    let referredBy = null;
    if (referralCode) {
      const [referrer] = await db.query('SELECT referral_code FROM users WHERE referral_code = ?', [referralCode]);
      if (referrer.length > 0) {
        referredBy = referrer[0].referral_code;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert new user with BOTH their own code and who referred them
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, referral_code, referred_by) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, myReferralCode, referredBy]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: userId, name, email, role: 'user', referral_code: myReferralCode }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        referrals_count: user.referrals_count,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, balance, referrals_count, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?', [otp, expiresAt, email]);

    await transporter.sendMail({
      from: '"Earn Plaza" <no-reply@earnplaza.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}. It expires in 15 minutes.`
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const [users] = await db.query('SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid request.' });
    }

    const user = users[0];
    if (user.reset_otp !== otp || new Date() > new Date(user.reset_otp_expires)) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?', [hashedPassword, user.id]);

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error resetting password.' });
  }
});

// --- TASK ROUTES ---

app.get('/api/tasks', optionalToken, async (req, res) => {
  try {
    let query = `
      SELECT * FROM tasks 
      WHERE (expires_at IS NULL OR expires_at > NOW()) 
      AND slots_claimed < slots
    `;
    const params = [];

    if (req.user && req.user.id) {
      query += ` AND id NOT IN (SELECT task_id FROM task_submissions WHERE user_id = ?)`;
      params.push(req.user.id);
    }

    query += ` ORDER BY created_at DESC`;

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { title, description, reward, category, slots, durationHours } = req.body;
    if (!title || !description || !reward) {
      return res.status(400).json({ error: 'Title, description, and reward are required.' });
    }

    const hours = parseInt(durationHours) || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const taskSlots = parseInt(slots) || 10;

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, reward, category, slots, expires_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, parseFloat(reward), category || 'social', taskSlots, expiresAt, req.user.id]
    );

    const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

app.delete('/api/tasks/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

app.post('/api/tasks/submit', verifyToken, async (req, res) => {
  try {
    const { taskId, proof } = req.body;
    if (!taskId || !proof) {
      return res.status(400).json({ error: 'Task ID and proof are required.' });
    }

    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND (expires_at IS NULL OR expires_at > NOW()) AND slots_claimed < slots',
      [taskId]
    );

    if (tasks.length === 0) {
      return res.status(400).json({ error: 'Task is expired, full, or does not exist.' });
    }

    const task = tasks[0];

    const [existing] = await db.query(
      'SELECT id FROM task_submissions WHERE task_id = ? AND user_id = ?',
      [taskId, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted proof for this task.' });
    }

    await db.query(
      'INSERT INTO task_submissions (task_id, user_id, proof, status) VALUES (?, ?, ?, "pending")',
      [taskId, req.user.id, proof]
    );

    await db.query('UPDATE tasks SET slots_claimed = slots_claimed + 1 WHERE id = ?', [task.id]);

    res.json({ success: true, message: 'Proof submitted successfully! Waiting for admin approval.' });
  } catch (err) {
    console.error('Task submission error:', err);
    res.status(500).json({ error: 'Server error processing task submission.' });
  }
});

// --- DEPOSIT & CAMPAIGN ROUTES ---

// POST /api/user/deposit (and aliases)
app.post(['/api/user/deposit', '/api/user/deposits', '/api/deposits'], verifyToken, async (req, res) => {
  const { amount, reference, referenceId, paymentMethod } = req.body;
  const depositAmount = parseFloat(amount);

  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount.' });
  }

  const txRef = reference || referenceId || `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const method = paymentMethod || 'Bank Transfer';

  try {
    const [result] = await db.query(
      'INSERT INTO deposits (user_id, amount, payment_method, reference, status) VALUES (?, ?, ?, ?, "pending")',
      [req.user.id, depositAmount, method, txRef]
    );

    return res.json({
      success: true,
      message: 'Deposit request submitted successfully! Awaiting approval.',
      depositId: result.insertId,
      reference: txRef
    });
  } catch (err) {
    console.error('Deposit request error:', err);
    return res.status(500).json({ error: 'Failed to process deposit request.' });
  }
});

// GET /api/admin/deposits
// Example Express route
app.post('/api/deposits', verifyToken, async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    // ... logic to save deposit to database ...
    
    // MUST RETURN JSON:
    return res.status(200).json({ message: "Deposit request submitted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// POST /api/admin/deposits/:id/action
app.post('/api/admin/deposits/:id/action', verifyToken, verifyAdmin, async (req, res) => {
  const depositId = req.params.id;
  const { action } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [deposits] = await connection.query(
      'SELECT * FROM deposits WHERE id = ? AND status = "pending" FOR UPDATE',
      [depositId]
    );

    if (deposits.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pending deposit request not found.' });
    }

    const deposit = deposits[0];
    const refCode = deposit.reference || deposit.reference_id || deposit.proof || 'N/A';

    if (action === 'approve') {
      // 1. Update deposit record status
      await connection.query('UPDATE deposits SET status = "approved" WHERE id = ?', [depositId]);

      // 2. Increase user balance
      await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [deposit.amount, deposit.user_id]);

      // 3. Log completed transaction
      await connection.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, "deposit", ?, ?, "completed")',
        [deposit.user_id, deposit.amount, `Wallet Deposit (Ref: ${refCode})`]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Deposit approved and balance credited!' });

    } else if (action === 'reject') {
      // 1. Mark deposit as rejected
      await connection.query('UPDATE deposits SET status = "rejected" WHERE id = ?', [depositId]);

      await connection.commit();
      return res.json({ success: true, message: 'Deposit request rejected.' });

    } else {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid action specified.' });
    }
  } catch (err) {
    await connection.rollback();
    console.error('Deposit action error:', err);
    res.status(500).json({ error: 'Failed to process deposit action.' });
  } finally {
    connection.release();
  }
});

// --- SUBMISSIONS MANAGEMENT ROUTES ---

app.get('/api/admin/submissions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [submissions] = await db.query(
      `SELECT s.*, t.title as task_title, t.reward, u.name as user_name, u.email as user_email 
       FROM task_submissions s 
       JOIN tasks t ON s.task_id = t.id 
       JOIN users u ON s.user_id = u.id 
       ORDER BY s.created_at DESC`
    );
    res.json(submissions);
  } catch (err) {
    console.error('Fetch admin submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch task submissions.' });
  }
});

app.post('/api/admin/submissions/:id/action', verifyToken, verifyAdmin, async (req, res) => {
  const submissionId = req.params.id;
  const { action } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [subs] = await connection.query(
      `SELECT s.*, t.title, t.reward FROM task_submissions s JOIN tasks t ON s.task_id = t.id WHERE s.id = ? FOR UPDATE`,
      [submissionId]
    );

    if (subs.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const sub = subs[0];
    if (sub.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Submission is already ${sub.status}.` });
    }

    if (action === 'approve') {
      await connection.query('UPDATE task_submissions SET status = "approved" WHERE id = ?', [submissionId]);
      await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [sub.reward, sub.user_id]);
      await connection.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, "earning", ?, ?, "completed")',
        [sub.user_id, sub.reward, `Earned from task: ${sub.title}`]
      );

      await connection.commit();
      res.json({ success: true, message: 'Submission approved and user credited!' });
    } else if (action === 'reject') {
      await connection.query('UPDATE task_submissions SET status = "rejected" WHERE id = ?', [submissionId]);
      await connection.query('UPDATE tasks SET slots_claimed = GREATEST(0, slots_claimed - 1) WHERE id = ?', [sub.task_id]);

      await connection.commit();
      res.json({ success: true, message: 'Submission rejected.' });
    } else {
      await connection.rollback();
      res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (err) {
    await connection.rollback();
    console.error('Admin submission action error:', err);
    res.status(500).json({ error: 'Server error processing submission action.' });
  } finally {
    connection.release();
  }
});

// --- REFERRALS ROUTES ---

// GET /api/user/referrals - Fetch summary stats for the logged-in user
app.get('/api/user/referrals', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's referral code
    const [userRows] = await db.query('SELECT referral_code FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const myCode = userRows[0].referral_code;

    // Count referrals
    const [refRows] = await db.query(
      'SELECT COUNT(*) AS total_referrals FROM users WHERE referred_by = ?',
      [myCode]
    );

    res.json({
      referralCode: myCode,
      referralLink: `http://localhost:5173/?ref=${myCode}`,
      totalReferrals: refRows[0].total_referrals
    });

  } catch (err) {
    console.error('Error fetching referral stats:', err);
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

// GET /api/user/referrals/:userId - Fetch list of users referred by a specific user ID
app.get('/api/user/referrals/:userId', verifyToken, async (req, res) => {
  try {
    // 1. Fetch referral code using target userId
    const [userRows] = await db.query('SELECT referral_code FROM users WHERE id = ?', [req.params.userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const myCode = userRows[0].referral_code;

    // 2. Query all users referred by that code
    const [referrals] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE referred_by = ?',
      [myCode]
    );

    res.json(referrals);

  } catch (err) {
    console.error('Fetch referrals error:', err);
    res.status(500).json({ error: 'Failed to fetch referral list.' });
  }
});

// --- WITHDRAWAL & TRANSACTIONS ROUTES ---

const MIN_REFERRALS_REQUIRED = 3;
const MIN_WITHDRAWAL_AMOUNT = 10.0;

app.post('/api/withdrawals', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { amount, paymentMethod, accountDetails } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL_AMOUNT) {
      return res.status(400).json({ error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.` });
    }

    if (!accountDetails || typeof accountDetails !== 'string' || accountDetails.trim() === '') {
      return res.status(400).json({ error: 'Please provide valid account or destination details.' });
    }

    await connection.beginTransaction();

    // 1. Lock user row and fetch referral_code
    const [users] = await connection.query('SELECT balance, referral_code FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    const currentBalance = parseFloat(user.balance);

    // 2. Count total active referrals dynamically using referral_code
    const [refRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM users WHERE referred_by = ?', 
      [user.referral_code]
    );
    const activeReferrals = refRows[0].total;

    // 3. Enforce the 3-referral requirement
    if (activeReferrals < MIN_REFERRALS_REQUIRED) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Withdrawal locked. You need at least ${MIN_REFERRALS_REQUIRED} referrals to withdraw (You currently have ${activeReferrals}).` 
      });
    }

    // 4. Check balance
    if (currentBalance < withdrawAmount) {
      await connection.rollback();
      return res.status(400).json({ error: `Insufficient balance. Your balance is $${currentBalance.toFixed(2)}.` });
    }

    const fee = withdrawAmount * 0.25;
    const netPayout = withdrawAmount - fee;

    // 5. Deduct total amount from user balance
    await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [withdrawAmount, req.user.id]);
    
    const description = `Method: ${paymentMethod} | Details: ${accountDetails.trim()} | Fee: $${fee.toFixed(2)}`;

    // 6. Record transaction
    await connection.query(
      `INSERT INTO transactions (user_id, type, amount, fee, description, status) 
       VALUES (?, 'withdrawal', ?, ?, ?, 'pending')`,
      [req.user.id, netPayout, fee, description]
    );

    await connection.commit();

    res.json({ 
      success: true, 
      message: 'Withdrawal request submitted successfully!',
      requested: withdrawAmount,
      fee: fee,
      netPayout: netPayout,
      newBalance: (currentBalance - withdrawAmount).toFixed(2)
    });
  } catch (err) {
    await connection.rollback();
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Server error processing withdrawal.' });
  } finally {
    connection.release();
  }
});

app.get('/api/user/earnings-history/:userId', verifyToken, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    if (parseInt(req.user.id) !== parseInt(requestedUserId)) {
      const [adminCheck] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
      if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Cannot access another user\'s ledger.' });
      }
    }

    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [requestedUserId]
    );
    res.json(transactions);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history.' });
  }
});
// --- ADMIN WITHDRAWAL MANAGEMENT ROUTES ---

app.get('/api/admin/withdrawals', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [withdrawals] = await db.query(`
      SELECT 
        t.*, 
        u.name as user_name, 
        u.email as user_email,
        (SELECT COUNT(*) FROM users ref WHERE ref.referred_by = u.referral_code) as referrals_count
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'withdrawal'
      ORDER BY t.created_at DESC
    `);
    
    res.json(withdrawals);
  } catch (err) {
    console.error('Fetch admin withdrawals error:', err);
    res.status(500).json({ error: 'Failed to fetch withdrawal requests.' });
  }
});

app.post('/api/admin/withdrawals/:id/action', verifyToken, verifyAdmin, async (req, res) => {
  const withdrawalId = req.params.id;
  const { action } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [txs] = await connection.query('SELECT * FROM transactions WHERE id = ? AND type = "withdrawal" FOR UPDATE', [withdrawalId]);
    if (txs.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Withdrawal transaction not found.' });
    }
    
    const tx = txs[0];
    if (tx.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Withdrawal is already ${tx.status}.` });
    }

    if (action === 'approve') {
      await connection.query('UPDATE transactions SET status = "completed" WHERE id = ?', [withdrawalId]);
      await connection.commit();
      res.json({ success: true, message: 'Withdrawal marked as approved/completed.' });
    } else if (action === 'reject') {
      const totalRefund = Number(tx.amount) + Number(tx.fee || 0);
      await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [totalRefund, tx.user_id]);
      await connection.query('UPDATE transactions SET status = "rejected", description = CONCAT(description, " [REJECTED & REFUNDED]") WHERE id = ?', [withdrawalId]);
      
      await connection.commit();
      res.json({ success: true, message: 'Withdrawal rejected and funds refunded to user balance.' });
    } else {
      await connection.rollback();
      res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (err) {
    await connection.rollback();
    console.error('Admin withdrawal action error:', err);
    res.status(500).json({ error: 'Server error processing withdrawal action.' });
  } finally {
    connection.release();
  }
});
// --- SERVE FRONTEND IN PRODUCTION ---
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));
// Handles any requests that don't match the API routes above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// --- LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));