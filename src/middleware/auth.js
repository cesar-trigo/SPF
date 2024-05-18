export const auth = (req, res, next) => {
  if (!req.session.user) {
    res.setHeader("Content-Type", "application/json");
    return res.redirect("/login");
  }
  next();
};

export const admin = (req, res, next) => {
  if (!req.session.admin) {
    res.setHeader("Content-Type", "application/json");
    return res.redirect("/login");
  }
  next();
};
