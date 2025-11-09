import db from "../client.js";
import { createItem } from "./items.js";

/**
 * Bulk create items within a transaction
 * All items succeed or all fail (atomic operation)
 * @param {number} userId - User ID creating the items
 * @param {Array} items - Array of item objects to create
 * @param {Object} lookupMaps - Maps for converting names to IDs
 * @returns {Promise<Object>} - { success, count, items }
 */
export async function bulkCreateItems(userId, items, lookupMaps) {
  const { categories, statuses, gradingCompanies, conditions } = lookupMaps;

  // Create lookup maps (case-insensitive)
  const categoryMap = createLookupMap(categories);
  const statusMap = createLookupMap(statuses);
  const gradingMap = createLookupMap(gradingCompanies);
  const conditionMap = createLookupMap(conditions);

  // Default status to "Unlisted" if not provided
  const defaultStatus = statuses.find(s => s.name.toLowerCase() === 'unlisted');

  await db.query('BEGIN');

  try {
    const createdItems = [];

    for (const itemData of items) {
      // Map text values to IDs
      const category_id = itemData.category
        ? categoryMap[itemData.category.toLowerCase()]?.id
        : null;

      const status_id = itemData.status
        ? statusMap[itemData.status.toLowerCase()]?.id
        : (defaultStatus ? defaultStatus.id : null);

      const grading_company_id = itemData.grading_company
        ? gradingMap[itemData.grading_company.toLowerCase()]?.id
        : null;

      const condition_id = itemData.condition
        ? conditionMap[itemData.condition.toLowerCase()]?.id
        : null;

      // Parse tags if provided (convert comma-separated string to PostgreSQL array format)
      let tags = null;
      if (itemData.tags && typeof itemData.tags === 'string') {
        const tagsArray = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        tags = tagsArray.length > 0 ? tagsArray : null;
      }

      // Create item object for insertion
      const item = await createItem({
        user_id: userId,
        title: itemData.title,
        category_id,
        status_id,
        grading_company_id,
        condition_id,
        date_listed: itemData.date_listed || null,
        date_sold: itemData.date_sold || null,
        ebay_url: itemData.ebay_url || null,
        tags,
        image_url: null, // No image support in bulk import for now
        price_listed: itemData.price_listed || null,
        market_value: itemData.market_value || null,
        player_name: itemData.player_name || null,
        team_name: itemData.team_name || null,
        year: itemData.year || null,
        rookie: itemData.rookie || false,
        brand: itemData.brand || null,
        sub_brand: itemData.sub_brand || null,
        patch_count: itemData.patch_count || null,
        numbered_to: itemData.numbered_to || null,
        autograph: itemData.autograph || false,
        grade_value: itemData.grade_value || null,
      });

      createdItems.push(item);
    }

    await db.query('COMMIT');

    return {
      success: true,
      count: createdItems.length,
      items: createdItems,
    };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

/**
 * Create case-insensitive lookup map from array of objects with 'name' property
 */
function createLookupMap(items) {
  const map = {};
  for (const item of items) {
    map[item.name.toLowerCase()] = item;
  }
  return map;
}
