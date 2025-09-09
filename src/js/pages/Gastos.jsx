import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

function ControlDeGastos() {
  const STORAGE_KEY = "gastosMensuales";
  const USUARIOS_KEY = "usuarios";

  // Cargar gastos
  const [gastos, setGastos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return data.filter((g) => g.usuario && g.usuario.trim() !== "");
    } catch {
      return [];
    }
  });

  const [usuarios, setUsuarios] = useState(() => {
    try {
      const raw = localStorage.getItem(USUARIOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [usuario, setUsuario] = useState("");

  // Guardar gastos en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
  }, [gastos]);

  // ➕ Agregar gasto
  const handleAdd = () => {
    const montoNum = parseFloat(monto);

    if (!descripcion.trim() || isNaN(montoNum) || !usuario) {
      alert("Por favor completa todos los campos con valores válidos");
      return;
    }

    setGastos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        descripcion: descripcion.trim(),
        monto: montoNum,
        fecha,
        usuario,
      },
    ]);
    setDescripcion("");
    setMonto("");
    setFecha(new Date().toISOString().split("T")[0]);
    setUsuario("");
  };

  // 🗑 Eliminar gasto
  const handleDelete = (id) => {
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  // 🔄 Reasignar gasto al arrastrar
  const handleReassign = (gastoId, newUsuario) => {
    setGastos((prev) =>
      prev.map((g) => (g.id === gastoId ? { ...g, usuario: newUsuario } : g))
    );
  };

  // 📊 Totales
  const totalGeneral = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
  const cuotaPorUsuario = usuarios.length > 0 ? totalGeneral / usuarios.length : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Control de Gastos Mensuales (Kanban)
      </Typography>

      {/* Formulario */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6">Agregar gasto</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="number"
              label="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="date"
              label="Fecha"
              InputLabelProps={{ shrink: true }}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Select
              fullWidth
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Seleccionar usuario</MenuItem>
              {usuarios.map((u) => (
                <MenuItem key={u.id} value={u.nombre}>
                  {u.nombre}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="contained"
              onClick={handleAdd}
              sx={{ height: "100%" }}
            >
              +
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tablero Kanban */}
      <Grid container spacing={2}>
        {usuarios.map((u) => (
          <Grid item xs={12} sm={6} md={4} key={u.id}>
            <KanbanColumn
              usuario={u.nombre}
              gastos={gastos.filter((g) => g.usuario === u.nombre)}
              onDelete={handleDelete}
              onReassign={handleReassign}
            />
          </Grid>
        ))}
      </Grid>

      {/* Total General */}
      <Card sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6">Total de la casa</Typography>
        <Typography>Gasto mensual total: 💸 ${totalGeneral.toFixed(2)}</Typography>
        {usuarios.length > 0 && (
          <Typography>
            Cada usuario debe aportar: 💵 ${cuotaPorUsuario.toFixed(2)}
          </Typography>
        )}
      </Card>
    </Container>
  );
}

function KanbanColumn({ usuario, gastos, onDelete, onReassign }) {
  const ref = useRef(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const cleanupDrop = dropTargetForElements({
      element: ref.current,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const gastoId = source.data.id;
        onReassign(gastoId, usuario);
      },
    });

    return () => {
      cleanupDrop();
    };
  }, [usuario, onReassign]);

  const subtotal = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);

  return (
    <Card
      ref={ref}
      sx={{
        p: 1,
        minHeight: 300,
        backgroundColor: isOver ? "#f1f8e9" : "#fafafa",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        👤 {usuario}
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <List>
        {gastos.map((g) => (
          <DraggableGasto key={g.id} gasto={g} onDelete={onDelete} />
        ))}

        <Divider />
        <ListItem>
          <ListItemText
            primary={`Subtotal: $${subtotal.toFixed(2)}`}
            sx={{ fontWeight: "bold" }}
          />
        </ListItem>
      </List>
    </Card>
  );
}

function DraggableGasto({ gasto, onDelete }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const cleanupDrag = draggable({
      element: ref.current,
      getInitialData: () => ({ id: gasto.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    return () => {
      cleanupDrag();
    };
  }, [gasto.id]);

  return (
    <ListItem
      ref={ref}
      sx={{
        cursor: "grab",
        backgroundColor: isDragging ? "#e3f2fd" : "white",
        mb: 1,
        borderRadius: 1,
        boxShadow: isDragging ? 3 : 1,
        transition: "all 0.2s ease-in-out",
      }}
      secondaryAction={
        <IconButton edge="end" onClick={() => onDelete(gasto.id)}>
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemText
        primary={`${new Date(gasto.fecha).toLocaleDateString()} - ${gasto.descripcion}`}
        secondary={`$${Number(gasto.monto || 0).toFixed(2)}`}
      />
    </ListItem>
  );
}

export default ControlDeGastos;