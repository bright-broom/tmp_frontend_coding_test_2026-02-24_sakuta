import {
  filterBuildings,
  getCapRateChartData,
  getOccupancyRateChartData,
  calculateAverage,
  formatDate,
  formatDateJP,
  formatPrice,
  formatArea,
  formatCapRate,
  formatOccupancyRate,
  getAssetTypeLabels,
  countAssetTypes,
} from '@/lib';
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
  capRateHistories: [
    { id: 'cap1', jReitBuildingId: 'test-building-1', capRate: '5.00', closingDate: '2020-06-30' },
    { id: 'cap2', jReitBuildingId: 'test-building-1', capRate: '4.80', closingDate: '2020-12-31' },
    { id: 'cap3', jReitBuildingId: 'test-building-1', capRate: '4.50', closingDate: '2021-06-30' },
  ],
  financials: [
    { leasing: { occupancyRate: '98.00' } },
    { leasing: { occupancyRate: '99.50' } },
    { leasing: { occupancyRate: '100.00' } },
  ],
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
  capRateHistories: [
    { id: 'cap4', jReitBuildingId: 'test-building-2', capRate: '6.00', closingDate: '2020-06-30' },
    { id: 'cap5', jReitBuildingId: 'test-building-2', capRate: '5.50', closingDate: '2020-12-31' },
  ],
  financials: [
    { leasing: { occupancyRate: '95.00' } },
    { leasing: { occupancyRate: '97.00' } },
  ],
};

describe('filterBuildings', () => {
  const buildings = [mockBuilding, mockBuilding2];

  it('returns all buildings when no filters applied', () => {
    const result = filterBuildings(buildings, { keyword: '', assetTypes: [] });
    expect(result).toHaveLength(2);
  });

  it('filters by keyword in building name', () => {
    const result = filterBuildings(buildings, { keyword: '渋谷', assetTypes: [] });
    expect(result).toHaveLength(1);
    expect(result[0].buildingSpec.name).toBe('テストビル渋谷');
  });

  it('filters by keyword in address', () => {
    const result = filterBuildings(buildings, { keyword: '大阪', assetTypes: [] });
    expect(result).toHaveLength(1);
    expect(result[0].buildingSpec.address).toContain('大阪');
  });

  it('filters by asset type', () => {
    const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isOffice'] });
    expect(result).toHaveLength(1);
    expect(result[0].assetType.isOffice).toBe(true);
  });

  it('filters by multiple asset types (OR logic)', () => {
    const result = filterBuildings(buildings, { keyword: '', assetTypes: ['isOffice', 'isRetail'] });
    expect(result).toHaveLength(2);
  });

  it('combines keyword and asset type filters', () => {
    const result = filterBuildings(buildings, { keyword: '渋谷', assetTypes: ['isOffice'] });
    expect(result).toHaveLength(1);
    expect(result[0].buildingSpec.name).toBe('テストビル渋谷');
  });

  it('returns empty array when no matches', () => {
    const result = filterBuildings(buildings, { keyword: '存在しない', assetTypes: [] });
    expect(result).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const result = filterBuildings(buildings, { keyword: 'テスト', assetTypes: [] });
    expect(result).toHaveLength(2);
  });
});

describe('getCapRateChartData', () => {
  it('returns empty array for empty buildings', () => {
    const result = getCapRateChartData([]);
    expect(result).toHaveLength(0);
  });

  it('calculates average cap rates by date', () => {
    const result = getCapRateChartData([mockBuilding, mockBuilding2]);

    // 2020-06-30: (5.00 + 6.00) / 2 = 5.50
    const june2020 = result.find((d) => d.date === '2020-06-30');
    expect(june2020?.value).toBe(5.5);

    // 2020-12-31: (4.80 + 5.50) / 2 = 5.15
    const dec2020 = result.find((d) => d.date === '2020-12-31');
    expect(dec2020?.value).toBe(5.15);

    // 2021-06-30: 4.50 (only one building)
    const june2021 = result.find((d) => d.date === '2021-06-30');
    expect(june2021?.value).toBe(4.5);
  });

  it('sorts data by date', () => {
    const result = getCapRateChartData([mockBuilding]);
    expect(result[0].date).toBe('2020-06-30');
    expect(result[1].date).toBe('2020-12-31');
    expect(result[2].date).toBe('2021-06-30');
  });
});

describe('getOccupancyRateChartData', () => {
  it('returns empty array for empty buildings', () => {
    const result = getOccupancyRateChartData([]);
    expect(result).toHaveLength(0);
  });

  it('calculates average occupancy rates by date', () => {
    const result = getOccupancyRateChartData([mockBuilding, mockBuilding2]);

    // 2020-06-30: (98.00 + 95.00) / 2 = 96.50
    const june2020 = result.find((d) => d.date === '2020-06-30');
    expect(june2020?.value).toBe(96.5);

    // 2020-12-31: (99.50 + 97.00) / 2 = 98.25
    const dec2020 = result.find((d) => d.date === '2020-12-31');
    expect(dec2020?.value).toBe(98.25);
  });

  it('only includes data where both capRateHistories and financials exist', () => {
    const result = getOccupancyRateChartData([mockBuilding]);
    // mockBuilding has 3 entries in both arrays
    expect(result).toHaveLength(3);
  });
});

describe('calculateAverage', () => {
  it('returns 0 for empty data', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('calculates average correctly', () => {
    const data = [
      { date: '2020-01-01', value: 10 },
      { date: '2020-02-01', value: 20 },
      { date: '2020-03-01', value: 30 },
    ];
    expect(calculateAverage(data)).toBe(20);
  });
});

describe('formatDate', () => {
  it('formats date string to YYYY/MM format', () => {
    expect(formatDate('2020-06-30')).toBe('2020/06');
    expect(formatDate('2021-12-31')).toBe('2021/12');
  });
});

describe('formatDateJP', () => {
  it('formats date string to Japanese format', () => {
    expect(formatDateJP('2020-06-15')).toBe('2020年6月15日');
    expect(formatDateJP('2021-12-01')).toBe('2021年12月1日');
  });

  it('returns dash for null', () => {
    expect(formatDateJP(null)).toBe('-');
  });
});

describe('formatPrice', () => {
  it('formats price in billions (億円)', () => {
    expect(formatPrice(100000000)).toBe('1億円');
    expect(formatPrice(500000000)).toBe('5億円');
  });

  it('formats price with both billions and ten thousands (億万円)', () => {
    expect(formatPrice(150000000)).toBe('1億5,000万円');
    expect(formatPrice(123456000)).toBe('1億2,345万円');
  });

  it('formats price in ten thousands (万円)', () => {
    expect(formatPrice(10000)).toBe('1万円');
    expect(formatPrice(50000000)).toBe('5,000万円');
  });

  it('formats small prices in yen (円)', () => {
    expect(formatPrice(1000)).toBe('1,000円');
    expect(formatPrice(9999)).toBe('9,999円');
  });
});

describe('formatArea', () => {
  it('formats area with m² unit', () => {
    expect(formatArea('1000.00')).toBe('1,000 m²');
    expect(formatArea('1234.56')).toBe('1,234.56 m²');
  });
});

describe('formatCapRate', () => {
  it('formats cap rate with % suffix', () => {
    expect(formatCapRate(4.5)).toBe('4.50%');
    expect(formatCapRate(5.123)).toBe('5.12%');
  });

  it('allows custom decimals', () => {
    expect(formatCapRate(4.567, 1)).toBe('4.6%');
    expect(formatCapRate(4.567, 3)).toBe('4.567%');
  });
});

describe('formatOccupancyRate', () => {
  it('formats occupancy rate with % suffix (default 2 decimals)', () => {
    expect(formatOccupancyRate(98.5)).toBe('98.50%');
    expect(formatOccupancyRate(100)).toBe('100.00%');
  });

  it('allows custom decimals', () => {
    expect(formatOccupancyRate(98.567, 1)).toBe('98.6%');
  });
});

describe('getAssetTypeLabels', () => {
  it('returns labels for active asset types', () => {
    const assetType = {
      isOffice: true,
      isRetail: true,
      isHotel: false,
      isParking: false,
      isIndustrial: false,
      isLogistic: false,
      isResidential: false,
      isHealthCare: false,
      isOther: false,
    };
    const labels = getAssetTypeLabels(assetType);
    expect(labels).toContain('オフィス');
    expect(labels).toContain('商業施設');
    expect(labels).toHaveLength(2);
  });

  it('returns empty array for no active types', () => {
    const assetType = {
      isOffice: false,
      isRetail: false,
      isHotel: false,
      isParking: false,
      isIndustrial: false,
      isLogistic: false,
      isResidential: false,
      isHealthCare: false,
      isOther: false,
    };
    const labels = getAssetTypeLabels(assetType);
    expect(labels).toHaveLength(0);
  });
});

describe('countAssetTypes', () => {
  it('counts active asset types', () => {
    const assetType = {
      isOffice: true,
      isRetail: true,
      isHotel: true,
      isParking: false,
      isIndustrial: false,
      isLogistic: false,
      isResidential: false,
      isHealthCare: false,
      isOther: false,
    };
    expect(countAssetTypes(assetType)).toBe(3);
  });

  it('returns 0 for no active types', () => {
    const assetType = {
      isOffice: false,
      isRetail: false,
      isHotel: false,
      isParking: false,
      isIndustrial: false,
      isLogistic: false,
      isResidential: false,
      isHealthCare: false,
      isOther: false,
    };
    expect(countAssetTypes(assetType)).toBe(0);
  });
});
