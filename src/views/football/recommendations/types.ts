// 投注详情接口
export interface BettingDetail {
  id: number;
  jingcai_number: string;
  beidan_number: string;
  jingcai_handicap: number;
  beidan_handicap: number;
  win: number;
  draw: number;
  lose: number;
  home_win_rate: number;
  away_win_rate: number;
  recommended_result: string | string[];
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 比赛推荐记录接口
export interface MatchRecommendation {
  id: number;
  match_time: string;
  league: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string; // 主队队标
  away_team_logo?: string; // 客队队标
  home_win_rate: number;
  away_win_rate: number;
  status: string;
  notes: string;
  bold_recommendation?: string;
  created_at: string;
  updated_at: string;
  betting_details: BettingDetail[];
}

// API响应接口
export interface MatchRecommendationResponse {
  data: MatchRecommendation[];
  total: number;
  page: number;
  limit: number;
}

// 分页接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// 过滤表单接口
export interface FilterForm {
  league: string;
  status: string;
  dateRange: string[];
  team: string;
}

// 表格展示用的扁平化数据结构
export interface TableRowData {
  // 比赛基本信息
  matchId: number;
  match_time: string;
  league: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string; // 主队队标
  away_team_logo?: string; // 客队队标
  home_win_rate: number;
  away_win_rate: number;
  match_status: string;
  match_notes: string;
  match_created_at: string;
  match_updated_at: string;

  // 投注详情信息
  betting_id?: number;
  jingcai_number?: string;
  beidan_number?: string;
  jingcai_handicap?: number;
  beidan_handicap?: number;
  win?: number;
  draw?: number;
  lose?: number;
  betting_home_win_rate?: number;
  betting_away_win_rate?: number;
  recommended_result?: string | string[]; // 支持单选或多选
  bold_recommendation?: string; // 胆推荐类型
  betting_status?: string;
  betting_notes?: string;
  betting_created_at?: string;
  betting_updated_at?: string;

  // 用于合并单元格
  isFirstRow?: boolean; // 是否是该比赛的第一行
  rowSpan?: number; // 合并的行数

  // 编辑状态
  editingHomeRate?: boolean; // 是否正在编辑主队胜率
  editingAwayRate?: boolean; // 是否正在编辑客队胜率
}
