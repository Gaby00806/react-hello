import React, { useState, useEffect, useRef, useState as useReactState } from "react";
import { Link } from "react-router-dom";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RedeemIcon from "@mui/icons-material/Redeem";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const initialSections = [
  {
    id: "tareas",
    title: "Tareas",
    description: "Gestiona tus tareas pendientes",
    route: "/tareas",
    icon: <AssignmentIcon sx={{ fontSize: 50, color: "primary.main" }} />,
  },
  {
    id: "gastos",
    title: "Gastos",
    description: "Monitorea tus gastos diarios",
    route: "/gastos",
    icon: <MoneyOffIcon sx={{ fontSize: 50, color: "error.main" }} />,
  },
  {
    id: "objetivos",
    title: "Objetivos",
    description: "Define y sigue tus metas",
    route: "/objetivos",
    icon: <EmojiEventsIcon sx={{ fontSize: 50, color: "success.main" }} />,
  },
  {
    id: "recompensas",
    title: "Recompensas",
    description: "Disfruta tus logros con recompensas",
    route: "/recompensas",
    icon: <RedeemIcon sx={{ fontSize: 50, color: "warning.main" }} />,
  },
];

function Dashboard() {
  const [sections, setSections] = useState(initialSections);

  // Reordenar array al soltar
  const handleReorder = (sourceId, targetId) => {
    if (sourceId === targetId) return;

    const sourceIndex = sections.findIndex((s) => s.id === sourceId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    const newSections = [...sections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, moved);

    setSections(newSections);
  };

  return (
    <div style={{ padding: "40px" }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {sections.map((section) => (
          <DraggableCard
            key={section.id}
            section={section}
            onReorder={handleReorder}
          />
        ))}
      </Grid>
    </div>
  );
}

function DraggableCard({ section, onReorder }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useReactState(false);
  const [isOver, setIsOver] = useReactState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Hacer que la tarjeta sea arrastrable
    const cleanupDrag = draggable({
      element: ref.current,
      getInitialData: () => ({ id: section.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanupDrop = dropTargetForElements({
      element: ref.current,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const sourceId = source.data.id;
        onReorder(sourceId, section.id);
      },
    });

    return () => {
      cleanupDrag();
      cleanupDrop();
    };
  }, [section.id, onReorder]);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        ref={ref}
        sx={{
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          p: 2,
          cursor: "grab",
          transition: "all 0.25s ease-in-out",
          boxShadow: isDragging ? 6 : isOver ? 4 : 1,
          backgroundColor: isDragging
            ? "#e3f2fd"
            : isOver
            ? "#f1f8e9"
            : "white",
          transform: isDragging ? "scale(1.05)" : "scale(1)",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          {section.icon}
          <Typography variant="h6" component="div" gutterBottom>
            {section.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {section.description}
          </Typography>
          <Button
            component={Link}
            to={section.route}
            variant="contained"
            size="small"
          >
            Ir a {section.title}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default Dashboard;