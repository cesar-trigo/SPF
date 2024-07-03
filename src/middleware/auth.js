export const auth = (permissions = []) => {
  return (req, res, next) => {
    permissions = permissions.map(p => p.toLowerCase());

    if (!req.user?.role) {
      res.setHeader("Content-Type", "application/json");
      console.log(req.user);
      return res.status(401).json("There are no authenticated users");
    }

    if (!permissions.includes(req.user.role.toLowerCase())) {
      res.setHeader("Content-Type", "application/json");
      return res.status(403).json("The user does not have access to this route");
    }

    next();
  };
};
