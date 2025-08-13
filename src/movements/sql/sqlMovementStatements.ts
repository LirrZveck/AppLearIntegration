//
//----------------------------------------CONSULTAS-----------------------------------------------------------//
//Consulta todos los items para Produccion
export const selectAllProduction = `SELECT * FROM public.production_item`;
export const selectAllProductionActive = `SELECT * FROM public.production_item where status = true`;
//Consulta todos los items para Pendientes
export const selectAllPending = `SELECT * FROM public.pending_item`;
export const selectAllPendingActive = `SELECT * FROM public.pending_item where status = true`;
//Consulta todos los items para Averiados
export const selectAllfailed = `SELECT * FROM public.failed_item`;
export const selectAllfailedActive = `SELECT * FROM public.failed_item where status = true`;

export const selectStockMovementByStockMovementId = `
  SELECT sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center,
         json_agg(i.*) AS items
  FROM stock_movement sm
  LEFT JOIN item i ON sm.message_id = i.stock_movement_id
  WHERE sm.message_id = $1
  GROUP BY sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center;
`;

//--------------------------------------------INSERCIONES-----------------------------------------------------------//
// Inserta en la tabla production_item
export const insertProduction = `
      INSERT INTO public.finished_production_items (product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, create_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
export const insertPending = `
      INSERT INTO public.pending_item (product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, createdate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
export const insertFailed = `
      INSERT INTO public.failed_item (product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, createdate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

// Inserta los items asociados
export const updateItemProductionProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1 
    AND product_code = $2
    `;
export const updateItemPendingProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1 
    AND product_code = $2
    `;
export const updateItemFailedProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1 
    AND product_code = $2
    `;
