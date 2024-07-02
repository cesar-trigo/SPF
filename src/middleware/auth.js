export const auth = (permisos = []) => {
  return (req, res, next) => {
    permisos = permisos.map(p => p.toLowerCase());

    if (!req.user?.role) {
      res.setHeader("Content-Type", "application/json");
      console.log(req.user);
      return res.status(401).json("No hay usuarios autenticados");
    }

    if (!permisos.includes(req.user.role.toLowerCase())) {
      res.setHeader("Content-Type", "application/json");
      return res.status(403).json("El usuario no tiene acceso a esta ruta");
    }

    next();
  };
};
