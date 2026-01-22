import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  try {
    // 1. Insertar Proveedor CFE
    const proveedor = await prisma.proveedor.create({
      data: {
        nombre: 'CFE',
        cargo_fijo: 474.54,
        cargo_variable: 1.41,
        cargo_distribucion: 211.58,
        cargo_capacidad: 313.44,
        region: 'Veracruz - Oriente',
        demanda_minima: 10.00,
        factor_carga: 0.90,
      },
    });
    console.log('✅ Proveedor CFE creado:', proveedor.id);

    // 2. Insertar Tipos de Dispositivos
    await prisma.$executeRawUnsafe(`SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO'`);
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO tipos_dispositivos (id, nombre, consumo_minimo_w, consumo_maximo_w) VALUES
      (0, 'No Image Card', 0, 5),
      (1, 'Televisor', 50, 200),
      (2, 'Computadora de Escritorio', 100, 500),
      (3, 'Laptop', 30, 100),
      (4, 'Aire acondicionado', 800, 3500),
      (5, 'Refrigerador', 100, 600),
      (6, 'Microondas', 600, 1200),
      (7, 'Consola de videojuegos', 80, 150),
      (8, 'Arrocera', 500, 1000),
      (9, 'Modem', 10, 30),
      (10, 'Lavadora', 500, 2000),
      (11, 'Proyector', 150, 400),
      (12, 'Impresora', 100, 300),
      (13, 'Secadora de pelo', 800, 1800),
      (14, 'Bocinas', 10, 100),
      (15, 'Telefono Fijo', 5, 10),
      (16, 'Ventilador', 50, 200),
      (17, 'Plancha', 1000, 2000)
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), consumo_minimo_w = VALUES(consumo_minimo_w), consumo_maximo_w = VALUES(consumo_maximo_w)
    `);
    console.log('✅ 18 tipos de dispositivos creados');

    // 3. Insertar Tipos de Alerta
    const tiposAlerta = [
      { clave: 'sistema', nombre: 'Sistema', descripcion: 'Alerta del Sistema - Estas son notificaciones del sistema.', icono_svg: 'a1' },
      { clave: 'consumo', nombre: 'Consumo', descripcion: 'Alerta de Consumo - Estas son notificaciones por consumo de energía.', icono_svg: 'a2' },
      { clave: 'costo', nombre: 'Costo', descripcion: 'Alerta de Costo - Estas son notificaciones relacionadas al costo del servicio.', icono_svg: 'a3' },
    ];

    for (const alerta of tiposAlerta) {
      await prisma.tipoAlerta.create({ data: alerta });
    }
    console.log('✅ 3 tipos de alerta creados');

    console.log('🎉 Seed completado exitosamente!');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
