function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }

    return next();
  };
}

module.exports = { requireAuth, requireRole };
