function requireUser(req, res, next) {
    if (!req.user) {
      next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action"
      });
    } else if(!req.user.active) {
      next({
        name: "InactiveUserError",
        message: "Your account has been deactivated. Please contact support."
      });
    }
    next();
  }
  
  module.exports = {
    requireUser
  }