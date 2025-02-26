//

export const selectStock = `SELECT * FROM public.products`;

// Inserta en la tabla stockMovement
export const insertMovementQuery = `
      INSERT INTO stock_movement (message_id, message_date, message_type, message_user_id, logistics_center)
      VALUES ($1, $2, $3, $4, $5)
    `;

// Inserta los items asociados
export const insertItemQuery = `
      INSERT INTO item (product_code, lot, description, quantity, expired_date, cum, warehouse, stock_movement_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
