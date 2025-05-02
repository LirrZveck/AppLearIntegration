//
//----------------------------------------CONSULTAS-----------------------------------------------------------//
//Consulta todos los items ingresados
export const selectAllItems = `SELECT * FROM public.item`;
//Consulta todos los sotckMovement ingresados
export const selectAllMovements = `SELECT * FROM public.stock_movement`;
//Consulta los articulos ingresados por stock_movement
export const getItemsByMessageId = `SELECT 
i.id,
i.product_code,
i.lot,
i.description,
i.quantity,
i.expired_date,
i.cum,
i.warehouse,
sm.message_id,
sm.message_date,
sm.message_type,
sm.message_user_id,
sm.logistics_center
FROM 
stock_movement sm
JOIN 
item i ON sm.message_id = i.stock_movement_id
WHERE 
sm.message_id = $1`;



//--------------------------------------------INSERCIONES-----------------------------------------------------------//
// Inserta en la tabla stockMovement
export const insertMovementQuery = `
      INSERT INTO stock_movement (message_id, message_date, message_type, message_user_id, logistics_center,status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

// Inserta los items asociados
export const insertItemQuery = `
      INSERT INTO item (product_code, lot, description, quantity, expired_date, cum, warehouse, stock_movement_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;