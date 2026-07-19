-- Renombrar columna
ALTER TABLE usuarios RENAME COLUMN email TO username;

-- Renombrar índice asociado
ALTER INDEX idx_usuarios_email RENAME TO idx_usuarios_username;

-- Limpiar los datos (quitar '@alaburger.com' de los usernames actuales)
UPDATE usuarios
SET username = REPLACE(username, '@alaburger.com', '');
