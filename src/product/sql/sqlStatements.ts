// src\product\sql\sqlStatements.ts

// --- StockMovement queries ---
export const insertMovementQuery = `
  INSERT INTO stock_movement (message_id, message_date, message_type, message_user_id, logistics_center, status)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

export const selectProdItemByCodeAndLot = `SELECT * FROM production_item WHERE product_code = $1 AND lot = $2`;

export const deleteProductionItem = `DELETE FROM production_item WHERE id = $1`;

export const selectAllMovements = `
  SELECT sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center,
         json_agg(i.*) AS items
  FROM stock_movement sm
  LEFT JOIN item i ON sm.message_id = i.stock_movement_id
  GROUP BY sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center;
`;

// --- Item queries ---
export const insertItemQuery = `
  INSERT INTO item (product_code, lot, description, quantity, expired_date, cum, warehouse, stock_movement_id, status_prod, created_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
  RETURNING *;
`;

export const selectAllItems = `
  SELECT product_code, lot, description, quantity, expired_date, cum, warehouse, stock_movement_id, status_prod
  FROM item;
`;

export const selectAllItemsProduction = `
  SELECT product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, original_source_table
  FROM production_item;
`;

// --- Se creo para actualizar un item en caso de que haya un sobrante inicial ---
export const updateItemQuantityAndStatus = `
  UPDATE item SET quantity = $1, status_prod = $2 
  WHERE product_code = $3 AND lot = $4 AND stock_movement_id = $5;
`;

// --- Se creo para reinsertar un Pending item en caso de que haya un sobrante inicial ---
export const updatePendingItemQuantityAndStatus = `
  UPDATE pending_item SET quantity = $1, status_prod = $2 
  WHERE product_code = $3 AND lot = $4 AND message_id =$5;
`;
// --- Pending Item queries ---
export const insertPending = `
  INSERT INTO pending_item (product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, createdate)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *;
`;

export const selectAllPending = `
  SELECT product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, createdate
  FROM pending_item WHERE status = TRUE;
`;

// --- Production Reports queries ---
export const insertProductionReport = `
  INSERT INTO production_reports (
    product_code,
    description,
    total_produced,
    damaged_quantity,
    remaining_products,
    created_at
  )
  VALUES ($1, $2, $3, $4, $5, NOW())
  RETURNING *;
`;

export const selectProductionReports = `
  SELECT
    id,
    product_code as "productCode",
    description,
    total_produced as "totalProduced",
    damaged_quantity as "damagedQuantity",
    remaining_products as "remainingProducts",
    DATE(created_at) as "reportDate",
    created_at as "createdAt"
  FROM production_reports
  ORDER BY created_at DESC;
`;

// --- Sentencias para production_item y retorno a 'item' ---

// MODIFICACIÓN: Seleccionar explícitamente el ítem en producción con status TRUE
// y alias de columnas para camelCase.
export const selectCurrentInProductionItem = `
  SELECT
    id,
    product_code AS "productCode",
    lot,
    description,
    quantity,
    expired_date AS "expiredDate",
    cum,
    warehouse,
    message_id AS "messageId",
    status,
    createdate,
    original_source_table AS "originalSourceTable"
  FROM public.production_item
  WHERE status = TRUE
  LIMIT 1;
`;

export const insertInProductionItem = `
  INSERT INTO public.production_item (
    product_code,
    lot,
    description,
    quantity,
    expired_date,
    cum,
    warehouse,
    message_id,
    status,
    createdate,
    original_source_table
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *;
`;

export const deleteInProductionItem = `
  DELETE FROM public.production_item WHERE id = $1;
`;

export const truncateProductionItem = `TRUNCATE TABLE production_item RESTART IDENTITY;`;

export const updateItemToAvailable = `
  UPDATE public.item SET status_prod = TRUE WHERE product_code = $1 AND lot = $2;
`;

export const insertFinishedItems = `
  INSERT INTO finished_production_items (
    product_code, lot, description, quantity, expired_date, cum, warehouse, message_id, status, create_date
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *;
`;

export const selectFromItem = `SELECT * FROM item WHERE product_code = $1 AND lot = $2 AND status_prod = true;`;

export const selectFromPendingItems = `SELECT * FROM pending_item WHERE product_code = $1 AND lot = $2 AND status = true;`;

export const updatePendingItemToFalse = `UPDATE pending_item SET status = false WHERE product_code = $1 AND lot = $2`;

export const updateItemToFalse = `UPDATE item SET status_prod = false WHERE product_code = $1 AND lot = $2`;
