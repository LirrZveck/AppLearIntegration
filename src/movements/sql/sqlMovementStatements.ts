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

//--------------------------------------------INSERCIONES-----------------------------------------------------------//
// Inserta en la tabla production_item
export const insertProduction = `
      INSERT INTO public.production_item (produc_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7 $8, $9)
    `;
export const insertPending = `
      INSERT INTO public.pending_item (produc_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7 $8, $9)
    `;
export const insertFailed = `
      INSERT INTO public.failed_item (produc_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7 $8, $9)
    `;

// Inserta los items asociados
export const updateItemProductionProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1; 
    AND product_code = $2
    `;
export const updateItemPendingProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1; 
    AND product_code = $2
    `;
export const updateItemFailedProcessQuery = `
    UPDATE production_item SET status = false
    WHERE 
    message_id = $1; 
    AND product_code = $2
    `;
