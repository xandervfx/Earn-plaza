
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
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (err) {
      // Ignore token errors for public queries.
    }
  }
  next();
};

const verifyAdmin = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length || users[0].role !== 'admin') {
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

    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const myReferralCode =
      name.toLowerCase().replace(/\s+/g, '') +
      Math.floor(1000 + Math.random() * 9000);

    let referredBy = null;

    if (referralCode) {
      const [referrer] = await db.query(
        'SELECT referral_code FROM users WHERE referral_code = ?',
        [referralCode]
      );

      if (referrer.length) referredBy = referrer[0].referral_code;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users
       (name, email, password, referral_code, referred_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email, hashedPassword, myReferralCode, referredBy]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email,
        role: 'user',
        referral_code: myReferralCode
      }
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

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    const [users] = await db.query(
      'SELECT id, name, email, balance, referrals_count, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// --- USER PROFILE MANAGEMENT ROUTES ---

app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, balance, referrals_count,
              role, referral_code, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const name = typeof req.body.name === 'string'
      ? req.body.name.trim()
      : '';

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        error: 'Name must be between 2 and 100 characters.'
      });
    }

    const [result] = await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, req.user.id]
    );

    if (result.affectedRows === 0) {
      const [users] = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!users.length) {
        return res.status(404).json({ error: 'User not found.' });
      }
    }

    const [updatedUsers] = await db.query(
      `SELECT id, name, email, balance, referrals_count,
              role, referral_code, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

app.post('/api/user/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        error: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        error: 'New password must be between 8 and 128 characters.'
      });
    }

    const [users] = await db.query(
      'SELECT id, password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const matches = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!matches) {
      return res.status(400).json({
        error: 'Current password is incorrect.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// --- FORGOT AND RESET PASSWORD ---

// Request a password-reset code (manual email delivery for now)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: 'Please enter your email address.'
      });
    }

    // Check whether the account exists.
    const [users] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    if (!users.length) {
      return res.status(404).json({
        error: 'No account was found with that email address.'
      });
    }

    // Generate a six-digit code.
    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    // Code expires in 15 minutes.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save the code in the existing database columns.
    await db.query(
      `UPDATE users
       SET reset_otp = ?, reset_otp_expires = ?
       WHERE id = ?`,
      [otp, expiresAt, users[0].id]
    );

    // No automated email is sent here.
    // Retrieve the saved code and send it manually.
    console.log('Password reset requested for:', email);

    return res.json({
      success: true,
      message:
        'Your reset request has been accepted. Contact Earn Plaza support to receive your verification code.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);

    return res.status(500).json({
      error: 'Unable to create a reset code right now. Please try again.'
    });
  }
});

// Verify the code and update the password.
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        error: 'All fields are required.'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Enter a valid six-digit verification code.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters.'
      });
    }

    const [users] = await db.query(
      `SELECT id, reset_otp, reset_otp_expires
       FROM users
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [email]
    );

    if (!users.length) {
      return res.status(400).json({
        error: 'Invalid or expired verification code.'
      });
    }

    const user = users[0];

    // Check the code and its expiration.
    if (
      !user.reset_otp ||
      String(user.reset_otp) !== otp ||
      !user.reset_otp_expires ||
      new Date() > new Date(user.reset_otp_expires)
    ) {
      return res.status(400).json({
        error: 'Invalid or expired verification code.'
      });
    }

    // Hash the new password using your existing bcrypt setup.
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the code so it cannot be reused.
    await db.query(
      `UPDATE users
       SET password = ?,
           reset_otp = NULL,
           reset_otp_expires = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (err) {
    console.error('Reset password error:', err);

    return res.status(500).json({
      error: 'Server error resetting password.'
    });
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
      query += ' AND id NOT IN (SELECT task_id FROM task_submissions WHERE user_id = ?)';
      params.push(req.user.id);
    }

    query += ' ORDER BY created_at DESC';

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
      return res.status(400).json({
        error: 'Title, description, and reward are required.'
      });
    }

    const hours = parseInt(durationHours, 10) || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const taskSlots = parseInt(slots, 10) || 10;

    const [result] = await db.query(
      `INSERT INTO tasks
       (title, description, reward, category, slots, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        parseFloat(reward),
        category || 'social',
        taskSlots,
        expiresAt,
        req.user.id
      ]
    );

    const [newTask] = await db.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

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
      return res.status(400).json({
        error: 'Task ID and proof are required.'
      });
    }

    const [tasks] = await db.query(
      `SELECT * FROM tasks
       WHERE id = ?
       AND (expires_at IS NULL OR expires_at > NOW())
       AND slots_claimed < slots`,
      [taskId]
    );

    if (!tasks.length) {
      return res.status(400).json({
        error: 'Task is expired, full, or does not exist.'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM task_submissions WHERE task_id = ? AND user_id = ?',
      [taskId, req.user.id]
    );

    if (existing.length) {
      return res.status(400).json({
        error: 'You have already submitted proof for this task.'
      });
    }

    await db.query(
      'INSERT INTO task_submissions (task_id, user_id, proof, status) VALUES (?, ?, ?, "pending")',
      [taskId, req.user.id, proof]
    );

    await db.query(
      'UPDATE tasks SET slots_claimed = slots_claimed + 1 WHERE id = ?',
      [tasks[0].id]
    );

    res.json({
      success: true,
      message: 'Proof submitted successfully! Waiting for admin approval.'
    });
  } catch (err) {
    console.error('Task submission error:', err);
    res.status(500).json({
      error: 'Server error processing task submission.'
    });
  }
});

// --- DEPOSIT ROUTES ---

app.post(
  ['/api/user/deposit', '/api/user/deposits', '/api/deposits'],
  verifyToken,
  async (req, res) => {
    const { amount, reference, referenceId, paymentMethod } = req.body;
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount.' });
    }

    const txRef = reference || referenceId ||
      `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const [result] = await db.query(
        `INSERT INTO deposits
         (user_id, amount, payment_method, reference, status)
         VALUES (?, ?, ?, ?, "pending")`,
        [req.user.id, depositAmount, paymentMethod || 'Bank Transfer', txRef]
      );

      res.json({
        success: true,
        message: 'Deposit request submitted successfully! Awaiting approval.',
        depositId: result.insertId,
        reference: txRef
      });
    } catch (err) {
      console.error('Deposit request error:', err);
      res.status(500).json({ error: 'Failed to process deposit request.' });
    }
  }
);

app.get('/api/admin/deposits', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [deposits] = await db.query(`
      SELECT d.*, u.name AS user_name, u.email AS user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);

    res.json(deposits);
  } catch (err) {
    console.error('Fetch admin deposits error:', err);
    res.status(500).json({ error: 'Failed to fetch deposit requests.' });
  }
});

app.post('/api/admin/deposits/:id/action', verifyToken, verifyAdmin, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [deposits] = await connection.query(
      'SELECT * FROM deposits WHERE id = ? AND status = "pending" FOR UPDATE',
      [req.params.id]
    );

    if (!deposits.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pending deposit request not found.' });
    }

    const deposit = deposits[0];
    const { action } = req.body;
    const refCode = deposit.reference || deposit.reference_id || deposit.proof || 'N/A';

    if (action === 'approve') {
      await connection.query(
        'UPDATE deposits SET status = "approved" WHERE id = ?',
        [req.params.id]
      );

      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [deposit.amount, deposit.user_id]
      );

      await connection.query(
        `INSERT INTO transactions
         (user_id, type, amount, description, status)
         VALUES (?, "deposit", ?, ?, "completed")`,
        [deposit.user_id, deposit.amount, `Wallet Deposit (Ref: ${refCode})`]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Deposit approved and balance credited!' });
    }

    if (action === 'reject') {
      await connection.query(
        'UPDATE deposits SET status = "rejected" WHERE id = ?',
        [req.params.id]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Deposit request rejected.' });
    }

    await connection.rollback();
    res.status(400).json({ error: 'Invalid action specified.' });
  } catch (err) {
    await connection.rollback();
    console.error('Deposit action error:', err);
    res.status(500).json({ error: 'Failed to process deposit action.' });
  } finally {
    connection.release();
  }
});

// --- TASK SUBMISSION ADMIN ROUTES ---

app.get('/api/admin/submissions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [submissions] = await db.query(`
      SELECT s.*, t.title AS task_title, t.reward,
             u.name AS user_name, u.email AS user_email
      FROM task_submissions s
      JOIN tasks t ON s.task_id = t.id
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);

    res.json(submissions);
  } catch (err) {
    console.error('Fetch admin submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch task submissions.' });
  }
});

app.post('/api/admin/submissions/:id/action', verifyToken, verifyAdmin, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [subs] = await connection.query(
      `SELECT s.*, t.title, t.reward
       FROM task_submissions s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id = ? FOR UPDATE`,
      [req.params.id]
    );

    if (!subs.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const sub = subs[0];

    if (sub.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Submission is already ${sub.status}.` });
    }

    if (req.body.action === 'approve') {
      await connection.query(
        'UPDATE task_submissions SET status = "approved" WHERE id = ?',
        [req.params.id]
      );

      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [sub.reward, sub.user_id]
      );

      await connection.query(
        `INSERT INTO transactions
         (user_id, type, amount, description, status)
         VALUES (?, "earning", ?, ?, "completed")`,
        [sub.user_id, sub.reward, `Earned from task: ${sub.title}`]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Submission approved and user credited!' });
    }

    if (req.body.action === 'reject') {
      await connection.query(
        'UPDATE task_submissions SET status = "rejected" WHERE id = ?',
        [req.params.id]
      );

      await connection.query(
        'UPDATE tasks SET slots_claimed = GREATEST(0, slots_claimed - 1) WHERE id = ?',
        [sub.task_id]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Submission rejected.' });
    }

    await connection.rollback();
    res.status(400).json({ error: 'Invalid action.' });
  } catch (err) {
    await connection.rollback();
    console.error('Admin submission action error:', err);
    res.status(500).json({ error: 'Server error processing submission action.' });
  } finally {
    connection.release();
  }
});

// --- REFERRAL ROUTES ---

app.get('/api/user/referrals', verifyToken, async (req, res) => {
  try {
    const [userRows] = await db.query(
      'SELECT referral_code FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const myCode = userRows[0].referral_code;

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
    res.status(500).json({ error: 'Failed to fetch referral data.' });
  }
});

app.get('/api/user/referrals/:userId', verifyToken, async (req, res) => {
  try {
    const [userRows] = await db.query(
      'SELECT referral_code FROM users WHERE id = ?',
      [req.params.userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [referrals] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE referred_by = ?',
      [userRows[0].referral_code]
    );

    res.json(referrals);
  } catch (err) {
    console.error('Fetch referrals error:', err);
    res.status(500).json({ error: 'Failed to fetch referral list.' });
  }
});

// --- WITHDRAWALS AND TRANSACTIONS ---

const MIN_REFERRALS_REQUIRED = 3;
const MIN_WITHDRAWAL_AMOUNT = 10.0;

app.post('/api/withdrawals', verifyToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { amount, paymentMethod, accountDetails } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL_AMOUNT) {
      await connection.rollback().catch(() => {});
      return res.status(400).json({
        error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.`
      });
    }

    if (!accountDetails || typeof accountDetails !== 'string' || !accountDetails.trim()) {
      return res.status(400).json({ error: 'Please provide valid account or destination details.' });
    }

    await connection.beginTransaction();

    const [users] = await connection.query(
      'SELECT balance, referral_code FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );

    if (!users.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    const currentBalance = parseFloat(user.balance);

    const [refRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM users WHERE referred_by = ?',
      [user.referral_code]
    );

    const activeReferrals = refRows[0].total;

    if (activeReferrals < MIN_REFERRALS_REQUIRED) {
      await connection.rollback();
      return res.status(400).json({
        error: `Withdrawal locked. You need at least ${MIN_REFERRALS_REQUIRED} referrals to withdraw (You currently have ${activeReferrals}).`
      });
    }

    if (currentBalance < withdrawAmount) {
      await connection.rollback();
      return res.status(400).json({
        error: `Insufficient balance. Your balance is $${currentBalance.toFixed(2)}.`
      });
    }

    const fee = withdrawAmount * 0.25;
    const netPayout = withdrawAmount - fee;

    await connection.query(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [withdrawAmount, req.user.id]
    );

    const description =
      `Method: ${paymentMethod} | Details: ${accountDetails.trim()} | Fee: $${fee.toFixed(2)}`;

    await connection.query(
      `INSERT INTO transactions
       (user_id, type, amount, fee, description, status)
       VALUES (?, 'withdrawal', ?, ?, ?, 'pending')`,
      [req.user.id, netPayout, fee, description]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully!',
      requested: withdrawAmount,
      fee,
      netPayout,
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

    if (parseInt(req.user.id, 10) !== parseInt(requestedUserId, 10)) {
      const [adminCheck] = await db.query(
        'SELECT role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!adminCheck.length || adminCheck[0].role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden. Cannot access another user\'s ledger.'
        });
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

app.get('/api/admin/withdrawals', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [withdrawals] = await db.query(`
      SELECT t.*, u.name AS user_name, u.email AS user_email,
        (SELECT COUNT(*) FROM users ref
         WHERE ref.referred_by = u.referral_code) AS referrals_count
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
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [txs] = await connection.query(
      'SELECT * FROM transactions WHERE id = ? AND type = "withdrawal" FOR UPDATE',
      [req.params.id]
    );

    if (!txs.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Withdrawal transaction not found.' });
    }

    const tx = txs[0];

    if (tx.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Withdrawal is already ${tx.status}.` });
    }

    if (req.body.action === 'approve') {
      await connection.query(
        'UPDATE transactions SET status = "completed" WHERE id = ?',
        [req.params.id]
      );

      await connection.commit();
      return res.json({ success: true, message: 'Withdrawal marked as approved/completed.' });
    }

    if (req.body.action === 'reject') {
      const totalRefund = Number(tx.amount) + Number(tx.fee || 0);

      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [totalRefund, tx.user_id]
      );

      await connection.query(
        `UPDATE transactions
         SET status = "rejected",
             description = CONCAT(description, " [REJECTED & REFUNDED]")
         WHERE id = ?`,
        [req.params.id]
      );

      await connection.commit();
      return res.json({
        success: true,
        message: 'Withdrawal rejected and funds refunded to user balance.'
      });
    }

    await connection.rollback();
    res.status(400).json({ error: 'Invalid action.' });
  } catch (err) {
    await connection.rollback();
    console.error('Admin withdrawal action error:', err);
    res.status(500).json({ error: 'Server error processing withdrawal action.' });
  } finally {
    connection.release();
  }
});

// --- SERVE FRONTEND IN PRODUCTION ---

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- LISTEN ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
