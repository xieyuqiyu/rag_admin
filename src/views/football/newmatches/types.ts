// 投注详情接口
export interface BettingDetail {
  jingcai_number: string;
  beidan_number: string;
  jingcai_handicap: number;
  beidan_handicap: number;
  win: number;
  draw: number;
  lose: number;
  betting_type_desc: string;
  sort_order: number;
  remark: string;
}

// 新赛事导入记录接口
export interface NewMatchRecord {
  id: number;
  match_time: string; // 比赛开赛时间（yyyy-MM-dd hh-mm）
  league: string; // 联赛名称
  home_team: string; // 主队名称
  away_team: string; // 客队名称
  home_team_logo?: string; // 主队队标
  away_team_logo?: string; // 客队队标
  match_unique_key: string; // 比赛唯一标识（时间+联赛+队伍）
  home_extra: string; // 主队附加信息
  away_extra: string; // 客队附加信息
  file_name: string; // 源文件名称
  import_status: string; // 导入状态（如 success、failed）
  betting_count: number; // 该场比赛投注详情数量
  created_at: string; // 创建时间（ISO格式）
  bettingDetails: BettingDetail[]; // 投注详情数组
}

// API响应接口
export interface NewMatchResponse {
  data: NewMatchRecord[];
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
  team: string;
  status: string;
  dateRange: string[];
  league: string;
}

// 球队接口
export interface Team {
  id: number;
  name: string;
  coach?: string;
  stadium?: string;
  league?: string;
  established_at?: string;
  logo_url?: string;
}
