import { render, screen, fireEvent } from '@testing-library/react';
import { SearchPanel } from '@/components/SearchPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { BuildingList } from '@/components/BuildingList';
import { Modal } from '@/components/ui/Modal';
import { ErrorBoundary, ErrorFallback, LoadingSpinner, LoadingState } from '@/components/ErrorBoundary';
import type { Building } from '@/types';

// Mock @tanstack/react-virtual for testing
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        start: index * estimateSize(index),
        size: estimateSize(index),
        key: index,
      })),
    getTotalSize: () => count * 100,
    scrollToIndex: jest.fn(),
  }),
}));

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
  it('renders range filter labels', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} />);

    expect(screen.getByText('稼働率')).toBeInTheDocument();
    expect(screen.getByText('最新鑑定評価額')).toBeInTheDocument();
    expect(screen.getByText('最新CR')).toBeInTheDocument();
  });

  it('renders search button', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} />);

    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} isLoading={true} />);

    expect(screen.getByText('検索中...')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} />);

    const submitButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: '',
      assetTypes: [],
      occupancyRate: { min: '', max: '' },
      appraisalPrice: { min: '', max: '' },
      capRate: { min: '', max: '' },
    });
  });

  it('renders reset button', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} />);

    expect(screen.getByText('検索結果をリセット')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    render(<SearchPanel onSearch={mockOnSearch} onReset={mockOnReset} />);

    const resetButton = screen.getByText('検索結果をリセット');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalled();
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
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding, mockBuilding2]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    expect(screen.getByText('テストビル渋谷')).toBeInTheDocument();
    expect(screen.getByText('テストビル大阪')).toBeInTheDocument();
  });

  it('renders cap rates', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    expect(screen.getByText('4.50%')).toBeInTheDocument();
  });

  it('renders asset type labels', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    expect(screen.getByText('オフィス')).toBeInTheDocument();
  });

  it('calls onBuildingClick when building name is clicked', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    const buildingLink = screen.getByText('テストビル渋谷');
    fireEvent.click(buildingLink);

    expect(mockOnBuildingClick).toHaveBeenCalledWith('test-building-1');
  });

  it('shows empty state when no buildings and not searched', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
        hasSearched={false}
      />
    );

    expect(screen.getByText('左のパネルから検索してください')).toBeInTheDocument();
  });

  it('shows no results message when searched but no buildings found', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
        hasSearched={true}
      />
    );

    expect(screen.getByText('検索条件に一致する建物がありません')).toBeInTheDocument();
  });

  it('renders acquisition date', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    render(
      <BuildingList
        buildings={[mockBuilding]}
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    expect(screen.getByText('2020/01/01')).toBeInTheDocument();
  });

  it('applies selected styling when building is selected', () => {
    const mockOnBuildingClick = jest.fn();
    const mockOnBuildingSelect = jest.fn();
    const { container } = render(
      <BuildingList
        buildings={[mockBuilding]}
        selectedId="test-building-1"
        onBuildingClick={mockOnBuildingClick}
        onBuildingSelect={mockOnBuildingSelect}
      />
    );

    // Selected building should have bg-blue-50 class
    const selectedElement = container.querySelector('.bg-blue-50');
    expect(selectedElement).toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const mockOnClose = jest.fn();
    const { container } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders content when open', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={mockOnClose} footer={<button>Save</button>}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Accessible Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('ErrorFallback', () => {
  it('renders default title', () => {
    render(<ErrorFallback />);

    expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorFallback title="カスタムエラー" />);

    expect(screen.getByText('カスタムエラー')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn();
    render(<ErrorFallback onRetry={mockOnRetry} />);

    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const mockOnRetry = jest.fn();
    render(<ErrorFallback onRetry={mockOnRetry} />);

    fireEvent.click(screen.getByText('再試行'));

    expect(mockOnRetry).toHaveBeenCalled();
  });
});

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.querySelector('.w-8')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    expect(container.querySelector('.w-5')).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    expect(container.querySelector('.w-12')).toBeInTheDocument();
  });
});

describe('LoadingState', () => {
  it('renders default message', () => {
    render(<LoadingState />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingState message="データを取得中..." />);

    expect(screen.getByText('データを取得中...')).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});
