'use server'

import { createServerSupabase } from '@/lib/db/server';
import { ActionResult } from './actionUtils';
import {
  CustomCategory,
  DEFAULT_ALLOCATION_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_SAVING_CATEGORIES
} from './categoryConstants';

export async function getCustomCategories(type?: 'expense' | 'saving' | 'allocation'): Promise<CustomCategory[]> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const client = supabase;
  let query = client
    .from('custom_categories')
    .select('*')
    .eq('user_id', user.id);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching custom categories:', error);
    return [];
  }

  return (data as CustomCategory[]) || [];
}

export async function addCustomCategory(
  name: string,
  type: 'expense' | 'saving' | 'allocation' = 'allocation'
): Promise<ActionResult<CustomCategory>> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const client = supabase;

  const { data, error } = await client
    .from('custom_categories')
    .insert({
      name,
      type,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await client
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (!existing) return { success: false, error: 'Duplicate found but could not be retrieved' };
      return { success: true, data: existing as CustomCategory };
    }
    console.error('Error adding custom category:', error);
    return { success: false, error: error.message };
  }

  if (!data) return { success: false, error: 'Failed to create category' };
  return { success: true, data: data as CustomCategory };
}

export async function getCombinedCategories(type: 'expense' | 'saving' | 'allocation' = 'allocation'): Promise<string[]> {
  let defaultCategories: string[] = [];

  if (type === 'allocation') {
    defaultCategories = [...DEFAULT_ALLOCATION_CATEGORIES];
  } else if (type === 'expense') {
    defaultCategories = [...DEFAULT_EXPENSE_CATEGORIES];
  } else if (type === 'saving') {
    defaultCategories = [...DEFAULT_SAVING_CATEGORIES];
  }

  const customCategories = await getCustomCategories(type);
  const customNames = customCategories.map(cat => cat.name);

  return [...new Set([...defaultCategories, ...customNames])];
}

export async function deleteCustomCategory(id: string): Promise<ActionResult<null>> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const client = supabase;
  const { error } = await client
    .from('custom_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting custom category:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}
