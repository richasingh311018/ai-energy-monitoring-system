const bcrypt = require('bcryptjs');
const User = require('../models/User');

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role
  };
}

exports.login = async (req, res, next) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username, active: true });
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.regenerate((regenerateError) => {
      if (regenerateError) return next(regenerateError);

      req.session.user = publicUser(user);
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.status(200).json({ success: true, data: { user: req.session.user } });
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.me = (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.session.user || null }
  });
};

exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('energyiq.sid');
    return res.status(200).json({ success: true, message: 'Signed out successfully' });
  });
};
