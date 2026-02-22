export type JReitBuilding = {
  id: string;
  acquisition: {
    acquisitionPrice: number; // 取得時取引価格
    acquisitionDate: string; // 初回取得日
    initialCapRate: string; // 取得時CR(キャップレート)
  };
  buildingSpec: {
    address: string; // 住所
    completedMonth: number; // 竣工月
    completedYear: number; // 竣工年
    grossFloorArea: string; // 延床面積
    latitude: string; // 緯度
    longitude: string; // 経度
    name: string; // 建物名
    netLeasableAreaTotal: string; // 貸付可能面積
  };
  yieldEvaluation: {
    appraisedPrice: number; // 最新鑑定評価額
    capRate: string; // 最新CR(キャップレート)
  };
  assetType: {
    isOffice: boolean;
    isRetail: boolean;
    isHotel: boolean;
    isParking: boolean;
    isIndustrial: boolean;
    isLogistic: boolean;
    isResidential: boolean;
    isHealthCare: boolean;
    isOther: boolean;
  };
  transfer: {
    transferDate: string | null; // 譲渡日
  };
  capRateHistories: {
    id: string;
    jReitBuildingId: string;
    capRate: string;
    closingDate: string;
  }[];
  financials: {
    leasing: {
      occupancyRate: string; // 稼働率
    };
  }[];
};

export type JReitData = {
  jReitBuildings: JReitBuilding[];
};
