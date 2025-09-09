import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function Usuarios() {
  const STORAGE_KEY = "usuarios";
  const PUNTOS_KEY = "puntosPorUsuario";

  const [usuarios, setUsuarios] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [ingresos, setIngresos] = useState("");
  const [meta, setMeta] = useState("");

  // Estado para edición en modal
  const [editUser, setEditUser] = useState(null);
  const [editIngresos, setEditIngresos] = useState("");
  const [editMeta, setEditMeta] = useState("");

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  }, [usuarios]);

  // ➕ Registrar usuario
  const handleAdd = () => {
    if (!nombre.trim() || !correo.trim() || !password.trim()) {
      alert("Completa todos los campos");
      return;
    }

    const nuevoUsuario = {
      id: Date.now().toString(),
      nombre,
      correo,
      password,
      ingresos: parseFloat(ingresos) || 0,
      meta: parseFloat(meta) || 0,
    };

    setUsuarios((prev) => [...prev, nuevoUsuario]);

    // 🔹 Resetear sus puntos a 0
    const puntos = JSON.parse(localStorage.getItem(PUNTOS_KEY)) || {};
    puntos[nuevoUsuario.nombre] = 0;
    localStorage.setItem(PUNTOS_KEY, JSON.stringify(puntos));

    // limpiar inputs
    setNombre("");
    setCorreo("");
    setPassword("");
    setIngresos("");
    setMeta("");
  };

  // 🗑 Eliminar usuario (y sus puntos)
  const handleDelete = (id) => {
    const user = usuarios.find((u) => u.id === id);
    if (!user) return;

    const nuevosUsuarios = usuarios.filter((u) => u.id !== id);
    setUsuarios(nuevosUsuarios);

    // 🔹 Eliminar sus puntos
    const puntos = JSON.parse(localStorage.getItem(PUNTOS_KEY)) || {};
    delete puntos[user.nombre];
    localStorage.setItem(PUNTOS_KEY, JSON.stringify(puntos));
  };

  // ✏️ Abrir modal para editar ingresos/meta
  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditIngresos(user.ingresos.toString());
    setEditMeta(user.meta.toString());
  };

  // 💾 Guardar cambios desde modal
  const handleSaveEdit = () => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? {
              ...u,
              ingresos: parseFloat(editIngresos) || 0,
              meta: parseFloat(editMeta) || 0,
            }
          : u
      )
    );
    setEditUser(null); // cerrar modal
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Registro de Usuarios
          </Typography>

          {/* Formulario de registro */}
          <TextField
            fullWidth
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Ingresos"
            type="number"
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Meta de ahorro"
            type="number"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleAdd}>
            Registrar
          </Button>

          {/* Lista de usuarios */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Usuarios
          </Typography>
          <List>
            {usuarios.map((u) => (
              <ListItem
                key={u.id}
                secondaryAction={
                  <>
                    <IconButton edge="end" onClick={() => handleOpenEdit(u)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(u.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${u.nombre} (💵 ${u.ingresos}, Meta: ${u.meta})`}
                  secondary={u.correo}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Modal de edición */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Editar Ingresos y Meta</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Ingresos"
            type="number"
            fullWidth
            value={editIngresos}
            onChange={(e) => setEditIngresos(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Meta de ahorro"
            type="number"
            fullWidth
            value={editMeta}
            onChange={(e) => setEditMeta(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Usuarios;