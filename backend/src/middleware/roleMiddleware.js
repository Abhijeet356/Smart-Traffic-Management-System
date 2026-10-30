/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts route access to specified roles
 * @param  {...string} allowedRoles - 'admin', 'police', 'citizen'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role [${req.user.role}] does not have permission to perform this action. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { authorize };
