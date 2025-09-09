import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
} from "@mui/material";

function Objetivos() {
  const USUARIOS_KEY = "usuarios";
  const GASTOS_KEY = "gastosMensuales";
  const COMPRAS_KEY = "compras";

  const [usuarios, setUsuarios] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [compras, setCompras] = useState([]);

  // 🔄 Función para recargar siempre desde localStorage
  const loadData = () => {
    setUsuarios(JSON.parse(localStorage.getItem(USUARIOS_KEY)) || []);
    setGastos(JSON.parse(localStorage.getItem(GASTOS_KEY)) || []);
    setCompras(JSON.parse(localStorage.getItem(COMPRAS_KEY)) || []);
  };

  // ✅ Cargar al montar
  useEffect(() => {
    loadData();
  }, []);

  // ✅ Escuchar cambios de localStorage también en la misma pestaña
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 500); // cada medio segundo chequea cambios
    return () => clearInterval(interval);
  }, []);

  // ✅ Unimos gastos y compras
  const todosMovimientos = [...gastos, ...compras];

  // ✅ Agrupar subtotales por usuario
  const subtotales = todosMovimientos.reduce((acc, m) => {
    acc[m.usuario] = (acc[m.usuario] || 0) + (m.monto || 0);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Objetivos
      </Typography>

      <Grid container spacing={3}>
        {usuarios.map((u) => {
          const ingresos = u.ingresos || 0;
          const meta = u.meta || 0;
          const disponible = ingresos - meta;
          const gastado = subtotales[u.nombre] || 0;
          const restante = disponible - gastado;
          const ahorro = meta + (restante > 0 ? restante : 0);
          const porcentaje =
            disponible > 0 ? (gastado / disponible) * 100 : 0;

          return (
            <Grid item xs={12} md={6} key={u.id}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    Presupuesto de {u.nombre}
                  </Typography>
                  <Typography>
                    Disponible: 💵 ${disponible.toFixed(2)} | Gastado: 💸 $
                    {gastado.toFixed(2)} | Restante: 💰 ${restante.toFixed(2)}
                  </Typography>
                  <Typography sx={{ mt: 1, fontWeight: "bold", color: "green" }}>
                    Ahorro acumulado: ⭐ ${ahorro.toFixed(2)} (
                    {u.frecuenciaMeta === "semanal" ? "Meta semanal" : "Meta mensual"})
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(porcentaje, 100)}
                    sx={{ height: 10, borderRadius: 5, mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default Objetivos;