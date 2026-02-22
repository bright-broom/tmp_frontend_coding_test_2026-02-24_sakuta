/**
 * Component Tests
 *
 * Reactコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SearchPanel } from '@/components/SearchPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { BuildingList } from '@/components/BuildingList';
import type { Building } from '@/types';

// Mock building data
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
  financials: [{ leasing: { occupancyRate: '98.50' } }],
};

const mockBuilding2: Building = {
  ...mockBuilding,
  id: 'test-building-2',
  buildingSpec: {
    ...mockBuilding.buildingSpec,
    name: 'テストビル大阪',
    address: '大阪府大阪市',
  },
  yieldEvaluation: {
    appraisedPrice: 800000000,
    capRate: '5.50',
  },
  assetType: {
    ...mockBuilding.assetType,
    isOffice: false,
    isRetail: true,
  },
  financials: [{ leasing: { occupancyRate: '95.00' } }],
};

describe('SearchPanel', () => {
  it('renders search input', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText('建物名・住所で検索...')).toBeInTheDocument();
  });

  it('renders asset type chips', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    expect(screen.getByText('オフィス')).toBeInTheDocument();
    expect(screen.getByText('商業施設')).toBeInTheDocument();
    expect(screen.getByText('ホテル')).toBeInTheDocument();
  });

  it('renders search button', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    expect(screen.getByRole('button', { name: /検索/ })).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} isLoading={true} />);

    expect(screen.getByText('検索中...')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('建物名・住所で検索...');
    fireEvent.change(input, { target: { value: '渋谷' } });

    const submitButton = screen.getByRole('button', { name: /検索/ });
    fireEvent.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: '渋谷',
      assetTypes: [],
    });
  });

  it('toggles asset type selection', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    const officeChip = screen.getByText('オフィス');
    fireEvent.click(officeChip);

    // Submit to verify selection
    const submitButton = screen.getByRole('button', { name: /検索/ });
    fireEvent.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: '',
      assetTypes: ['isOffice'],
    });
  });

  it('shows clear button when filters are applied', () => {
    const mockOnSearch = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('建物名・住所で検索...');
    fireEvent.change(input, { target: { value: '渋谷' } });

    expect(screen.getByText('クリア')).toBeInTheDocument();
  });
});

describe('StatsPanel', () => {
  it('renders building count', () => {
    render(<StatsPanel buildings={[mockBuilding, mockBuilding2]} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('件')).toBeInTheDocument();
  });

  it('calculates average cap rate', () => {
    render(<StatsPanel buildings={[mockBuilding, mockBuilding2]} />);

    // (4.50 + 5.50) / 2 = 5.00
    expect(screen.getByText('5.00')).toBeInTheDocument();
    expect(screen.getByText('平均CR')).toBeInTheDocument();
  });

  it('calculates average occupancy rate', () => {
    render(<StatsPanel buildings={[mockBuilding, mockBuilding2]} />);

    // (98.50 + 95.00) / 2 = 96.75
    expect(screen.getByText('96.8')).toBeInTheDocument();
    expect(screen.getByText('平均稼働率')).toBeInTheDocument();
  });

  it('shows dash for empty buildings', () => {
    render(<StatsPanel buildings={[]} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    // Cap rate and occupancy should show '-'
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});

describe('BuildingList', () => {
  it('renders building names', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding, mockBuilding2]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('テストビル渋谷')).toBeInTheDocument();
    expect(screen.getByText('テストビル大阪')).toBeInTheDocument();
  });

  it('renders building addresses', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument();
  });

  it('renders cap rates', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('4.50%')).toBeInTheDocument();
  });

  it('calls onSelect when building is clicked', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    const selectButton = screen.getByRole('button', { name: /テストビル渋谷を選択/ });
    fireEvent.click(selectButton);

    expect(mockOnSelect).toHaveBeenCalledWith('test-building-1');
  });

  it('shows detail button when building is selected', () => {
    const mockOnSelect = jest.fn();
    const mockOnDetail = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId="test-building-1"
        onSelect={mockOnSelect}
        onDetail={mockOnDetail}
      />
    );

    expect(screen.getByText('詳細を見る')).toBeInTheDocument();
  });

  it('calls onDetail when detail button is clicked', () => {
    const mockOnSelect = jest.fn();
    const mockOnDetail = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId="test-building-1"
        onSelect={mockOnSelect}
        onDetail={mockOnDetail}
      />
    );

    const detailButton = screen.getByText('詳細を見る');
    fireEvent.click(detailButton);

    expect(mockOnDetail).toHaveBeenCalledWith('test-building-1');
  });

  it('shows empty state when no buildings', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('該当する建物がありません')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('marks selected building with aria-selected', () => {
    const mockOnSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding, mockBuilding2]}
        selectedId="test-building-1"
        onSelect={mockOnSelect}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });
});
