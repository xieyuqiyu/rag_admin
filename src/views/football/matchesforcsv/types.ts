// 比赛接口
export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  score_home: number | null;
  score_away: number | null;
  stadium: string;
  status: "未开始" | "进行中" | "已结束";
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

// 导入记录接口
export interface ImportRecord {
  id: number;
  match_time: string;
  jingcai_number: string;
  beidan_number: string;
  league: string;
  home_team: string;
  away_team: string;
  is_single: string;
  bifa: string;
  final_home: string;
  final_handicap: string;
  final_away: string;
  external_id: string;
  analysis_document: string;
  file_name: string;
  import_status: string;
  created_at: string;

  jingcai_handicap: number;
  beidan_handicap: number;
  win: number;
  draw: number;
  lose: number;
  home_extra: string;
  away_extra: string;
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

export interface FilterForm {
  team: string;
  status: string;
  dateRange: string[];
  league: string;
}
