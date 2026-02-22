import { filterBuildings } from '@/lib';
import type { Building } from '@/types';

const mockBuilding: Building = {
  id: 'test-building-1',
  acquisition: {
    acquisitionPrice: 1000000000,
    acquisitionDate: '2020-01-01',
    initialCapRate: '5.00',
  },
  buildingSpec: {
    address: '東京都渋谷区',
    completedMonth: 3,
    completedYear: 2015,
    grossFloorArea: '1000.00',
    latitude: '35.6598',
    longitude: '139.7000',
    name: 'テストビル渋谷',
    netLeasableAreaTotal: '800.00',
  },
  yieldEvaluation: {
    appraisedPrice: 1200000000,
    capRate: '4.50',
  },
  assetType: {
    isOffice: true,
    isRetail: false,
    isHotel: false,
    isParking: false,
    isIndustrial: false,
    isLogistic: false,
    isResidential: false,
    isHealthCare: false,
    isOther: false,
  },
  transfer: {
    transferDate: null,
  },
  capRateHistories: [],
  financials: [],
};

const mockBuilding2: Building = {
  ...mockBuilding,
  id: 'test-building-2',
  buildingSpec: {
    ...mockBuilding.buildingSpec,
    address: '大阪府大阪市中央区',
    name: 'テストビル大阪',
  },
  assetType: {
    ...mockBuilding.assetType,
    isOffice: false,
    isRetail: true,
  },
};

const mockBuilding3: Building = {
  ...mockBuilding,
  id: 'test-building-3',
  buildingSpec: {
    ...mockBuilding.buildingSpec,
    address: '東京都港区',
    name: 'ホテル東京',
  },
  assetType: {
    ...mockBuilding.assetType,
    isOffice: false,
    isHotel: true,
  },
};

describe('Server Action filtering logic', () => {
  const buildings = [mockBuilding, mockBuilding2, mockBuilding3];

  describe('empty filters', () => {
    it('returns all buildings when filters are empty', () => {
      const result = filterBuildings(buildings, { keyword: '', assetTypes: [] });
      expect(result).toHaveLength(3);
    });
  });

  describe('keyword filtering', () => {
    it('filters by building name', () => {
      const result = filterBuildings(buildings, { keyword: '渋谷', assetTypes: [] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-building-1');
    });

    it('filters by address', () => {
      const result = filterBuildings(buildings, { keyword: '大阪', assetTypes: [] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-building-2');
    });

    it('filters by partial match', () => {
      const result = filterBuildings(buildings, { keyword: '東京', assetTypes: [] });
      expect(result).toHaveLength(2); // 渋谷(東京都) and ホテル東京(東京都港区)
    });

    it('is case insensitive', () => {
      const result = filterBuildings(buildings, { keyword: 'テスト', assetTypes: [] });
      expect(result).toHaveLength(2); // テストビル渋谷, テストビル大阪
    });

    it('returns empty array when no matches', () => {
      const result = filterBuildings(buildings, { keyword: '福岡', assetTypes: [] });
      expect(result).toHaveLength(0);
    });
  });

  describe('asset type filtering', () => {
    it('filters by single asset type', () => {
      const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isOffice'] });
      expect(result).toHaveLength(1);
      expect(result[0].assetType.isOffice).toBe(true);
    });

    it('filters by multiple asset types (OR logic)', () => {
      const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isOffice', 'isRetail'] });
      expect(result).toHaveLength(2);
    });

    it('filters by hotel asset type', () => {
      const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isHotel'] });
      expect(result).toHaveLength(1);
      expect(result[0].buildingSpec.name).toBe('ホテル東京');
    });

    it('returns empty array when no asset type matches', () => {
      const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isParking'] });
      expect(result).toHaveLength(0);
    });
  });

  describe('combined filtering', () => {
    it('combines keyword and asset type filters', () => {
      const result = filterBuildings(buildings, { keyword: '東京', assetTypes: ['isOffice'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-building-1');
    });

    it('returns empty when keyword matches but asset type does not', () => {
      const result = filterBuildings(buildings, { keyword: '渋谷', assetTypes: ['isHotel'] });
      expect(result).toHaveLength(0);
    });

    it('returns empty when asset type matches but keyword does not', () => {
      const result = filterBuildings(buildings, { keyword: '福岡', assetTypes: ['isOffice'] });
      expect(result).toHaveLength(0);
    });
  });
});
