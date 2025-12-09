# Simulador PowerTrack - Usuario 24

## Inicio Rapido

### 1. Backend
```bash
node app.js
```

### 2. Simulador  
```bash
node utils/simulator.js
```

### 3. Frontend
```bash
cd ../PowerTrack-FEND
npm run dev
```

## Configuracion

Cambiar intervalo:
```bash
set INTERVALO=5000
node utils/simulator.js
```

## Detener
Presiona Ctrl+C

## Verificar
- Frontend: Ver KPIs actualizandose
- BD: SELECT * FROM mediciones WHERE sensor_id=6 ORDER BY fecha_hora DESC LIMIT 10;
- API: curl http://localhost:5051/electrical_analysis/consumoPorDispositivosGrupos/24

