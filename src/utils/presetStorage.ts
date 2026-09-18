import { CalculationPreset } from '../types';
import { PRESETS as DEFAULT_PRESETS } from '../data/presets';

const STORAGE_KEY = 'custom_calculator_presets_v1';

export function getStoredCustomPresets(): CalculationPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => ({ ...p, isCustom: true }));
    }
  } catch (err) {
    console.error('Failed to load custom presets from localStorage:', err);
  }
  return [];
}

export function saveStoredCustomPresets(presets: CalculationPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets to localStorage:', err);
  }
}

export function addCustomPreset(preset: CalculationPreset): CalculationPreset[] {
  const current = getStoredCustomPresets();
  const newPreset: CalculationPreset = {
    ...preset,
    id: preset.id || `custom_${Date.now()}`,
    isCustom: true,
    createdAt: preset.createdAt || new Date().toISOString(),
  };
  // If id already exists, update it, otherwise prepend
  const existsIndex = current.findIndex((p) => p.id === newPreset.id);
  let updated: CalculationPreset[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = newPreset;
  } else {
    updated = [newPreset, ...current];
  }
  saveStoredCustomPresets(updated);
  return updated;
}

export function removeCustomPreset(id: string): CalculationPreset[] {
  const current = getStoredCustomPresets();
  const filtered = current.filter((p) => p.id !== id);
  saveStoredCustomPresets(filtered);
  return filtered;
}

export function getAllPresetsList(): CalculationPreset[] {
  const custom = getStoredCustomPresets();
  return [...custom, ...DEFAULT_PRESETS];
}

export function exportPresetsToJson(presets: CalculationPreset[]): string {
  return JSON.stringify(presets, null, 2);
}

export function importPresetsFromJson(jsonStr: string): {
  success: boolean;
  imported: CalculationPreset[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const valid: CalculationPreset[] = [];

    for (const item of list) {
      if (item && item.name && (item.category === 'batch' || item.category === 'spec')) {
        valid.push({
          ...item,
          id: item.id ? `imported_${item.id}_${Date.now()}` : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          isCustom: true,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (valid.length === 0) {
      return { success: false, imported: [], error: 'Не найдены корректные пресеты в файле JSON' };
    }

    const current = getStoredCustomPresets();
    const merged = [...valid, ...current];
    saveStoredCustomPresets(merged);
    return { success: true, imported: valid };
  } catch (e: any) {
    return { success: false, imported: [], error: e.message || 'Ошибка парсинга JSON' };
  }
}
