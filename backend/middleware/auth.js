// Auth Middleware
// Verifies the JWT issued at /api/auth/admin/login and attaches the decoded
// staff payload (id, email, role) onto req.staff. Used to gate every
// office-admin / faculty endpoint so students (and anonymous visitors)
// cannot reach them.

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

export function signStaffToken(staff) {
  return jwt.sign(
    { id: staff.id, email: staff.email, role: staff.role, name: staff.name },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// Requires ANY authenticated staff member (ADMIN or FACULTY).
export function requireStaff(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.staff = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Requires the ADMIN role specifically (office admin), not just any staff.
export function requireAdmin(req, res, next) {
  requireStaff(req, res, () => {
    if (req.staff.role !== 'ADMIN') {
      return res.status(403).json({ error: 'This action requires an Office Admin account.' });
    }
    next();
  });
}
