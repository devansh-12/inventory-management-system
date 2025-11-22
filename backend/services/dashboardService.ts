import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

export const getDashboardStats = async () => {
    // 1. KPIs
    const kpiQuery = await sql`
        SELECT
            (SELECT COALESCE(SUM(on_hand), 0) FROM stock) as total_stock,
            (SELECT COUNT(*) FROM products p 
             JOIN stock s ON p.id = s.product_id 
             WHERE s.on_hand <= p.reorder_level) as low_stock_items,
            (SELECT COUNT(*) FROM receipts WHERE status = 'Pending') as pending_receipts,
            (SELECT COUNT(*) FROM deliveries WHERE status = 'Pending') as pending_deliveries,
            (SELECT COUNT(*) FROM transfers WHERE status = 'In Progress') as active_transfers,
            (SELECT COUNT(*) FROM stock_adjustments WHERE created_at > NOW() - INTERVAL '7 days') as recent_adjustments
    `;

    const kpis = kpiQuery[0];

    // 2. Recent Activity (Union of different activities)
    const recentActivity = await sql`
        (SELECT 'receipt' as type, 'Receipt #' || reference || ' validated' as action, 
         u.name as user, created_at as time 
         FROM receipts r JOIN users u ON r.responsible_user_id = u.id 
         ORDER BY created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 'delivery' as type, 'Delivery #' || reference || ' completed' as action, 
         u.name as user, created_at as time 
         FROM deliveries d JOIN users u ON d.responsible_user_id = u.id 
         WHERE status = 'Done'
         ORDER BY created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 'transfer' as type, 'Transfer #' || reference || ' scheduled' as action, 
         u.name as user, created_at as time 
         FROM transfers t JOIN users u ON t.responsible_user_id = u.id 
         ORDER BY created_at DESC LIMIT 5)
        ORDER BY time DESC LIMIT 10
    `;

    // 3. Alerts (Low Stock)
    const alerts = await sql`
        SELECT 
            p.sku, 
            p.name as product, 
            w.name as location, 
            CASE WHEN s.on_hand = 0 THEN 'high' ELSE 'medium' END as priority,
            CASE WHEN s.on_hand = 0 THEN 'Out of Stock' ELSE 'Low Stock (' || s.on_hand || ' units)' END as issue
        FROM stock s
        JOIN products p ON s.product_id = p.id
        JOIN warehouses w ON s.warehouse_id = w.id
        WHERE s.on_hand <= p.reorder_level
        ORDER BY s.on_hand ASC
        LIMIT 5
    `;

    // 4. Warehouse Stats
    const warehouseStats = await sql`
        SELECT 
            w.name,
            COALESCE(SUM(s.on_hand), 0) as stock,
            COUNT(CASE WHEN s.on_hand <= p.reorder_level THEN 1 END) as low_stock,
            (SELECT COUNT(*) FROM move_history mh WHERE mh.from_warehouse_id = w.id OR mh.to_warehouse_id = w.id) as operations,
            CASE WHEN COUNT(CASE WHEN s.on_hand <= p.reorder_level THEN 1 END) > 5 THEN 'high' ELSE 'normal' END as status
        FROM warehouses w
        LEFT JOIN stock s ON w.id = s.warehouse_id
        LEFT JOIN products p ON s.product_id = p.id
        GROUP BY w.id, w.name
    `;

    // 5. Fast Moving Items (based on move history in last 30 days)
    const fastMoving = await sql`
        SELECT 
            p.name,
            p.sku,
            COUNT(*) as moved,
            '+' || ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM move_history WHERE date > NOW() - INTERVAL '60 days'), 0)), 1) || '%' as trend
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        WHERE mh.date > NOW() - INTERVAL '30 days'
        GROUP BY p.id, p.name, p.sku
        ORDER BY moved DESC
        LIMIT 5
    `;

    return {
        kpis: [
            { label: 'Total Stock Count', value: kpis.total_stock, change: '+0%', trend: 'neutral', period: 'vs last month' },
            { label: 'Low Stock Items', value: kpis.low_stock_items, change: '0%', trend: 'neutral', period: 'vs last week' },
            { label: 'Pending Receipts', value: kpis.pending_receipts, change: '0', trend: 'neutral', period: 'Today' },
            { label: 'Pending Deliveries', value: kpis.pending_deliveries, change: '0', trend: 'neutral', period: 'Today' },
            { label: 'Internal Transfers', value: kpis.active_transfers, change: '0', trend: 'neutral', period: 'In Progress' },
            { label: 'Adjustments Pending', value: kpis.recent_adjustments, change: '0', trend: 'neutral', period: 'Last 7 days' },
        ],
        recentActivity,
        alerts,
        warehouses: warehouseStats,
        fastMoving
    };
};
