/**
 * Middleware to check if the authenticated user is an administrator
 */
const adminCheck = (req, res, next) => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  
  if (
    req.user &&
    (req.user.role === 'admin' || (req.user.email && req.user.email.toLowerCase() === adminEmail))
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrators only' });
  }
};

export { adminCheck };
