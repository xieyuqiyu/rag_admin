import { http } from "@/utils/http";

export type TeamResult = {
  data: Array<{
    /** 球队ID */
    id: number;
    /** 球队名称 */
    name: string;
    /** 球队logo */
    logo_url: string;
    /** 球队简介 */
    url: string;
    /** 球队静态logo */
    staticUrl: string;
  }>;
  meta: {
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 总数量 */
    total: number;
  };
};

/** 球队管理
 *
 */

// 获取所有球队信息
export const getTeams = (params?: object) => {
  return http.request<TeamResult>("get", "/api/teams", { params });
};

// 获取球队名称和LOGO
export const getTeamNames = (params?: object) => {
  return http.request<TeamResult>("get", "/api/team-logos", { params });
};

/**
 * 创建新球队
 * @param data 球队数据，包含name, coach, stadium, league, established_at, logo_url
 * @returns 创建的球队信息
 */
export const createTeam = (data: {
  name: string;
  coach: string;
  stadium: string;
  league: string;
  established_at: string;
  logo_url: string;
}) => {
  return http.request("post", "/api/teams", { data });
};

/**
 * 更新球队信息
 * @param id 球队ID
 * @param data 更新的球队数据
 * @returns 更新后的球队信息
 */
export const updateTeam = (
  id: number,
  data: {
    name?: string;
    coach?: string;
    stadium?: string;
    league?: string;
    established_at?: string;
    logo_url?: string;
  }
) => {
  return http.request("put", `/api/teams/${id}`, { data });
};

/**
 * 删除球队
 * @param id 球队ID
 * @returns 删除结果
 */
export const deleteTeam = (id: number) => {
  return http.request("delete", `/api/teams/${id}`);
};

/**
 * 创建新比赛
 * @param data 比赛数据
 * @returns 创建的比赛信息
 */
export const createMatch = (data: {
  home_team: number;
  away_team: number;
  date: string;
  stadium: string;
  status: string;
  league: string;
  importID: string;
}) => {
  return http.request("post", "/api/matches", { data });
};

/**
 * 获取新赛事导入记录列表
 * @param params 查询参数，包含page和limit等
 * @returns 新赛事导入记录列表
 */
export const getNewMatches = (params?: { page?: number; limit?: number }) => {
  return http.request("get", "/api/new-matches", { params });
};

/**
 * 更新新赛事导入记录
 * @param id 记录ID
 * @param data 更新的数据
 * @returns 更新结果
 */
export const updateNewMatch = (
  id: number,
  data: {
    match_time?: string;
    league?: string;
    home_team?: string;
    away_team?: string;
    match_unique_key?: string;
    home_extra?: string;
    away_extra?: string;
  }
) => {
  return http.request("put", `/api/new-matches/${id}`, { data });
};

/**
 * 删除新赛事导入记录
 * @param id 记录ID
 * @returns 删除结果
 */
export const deleteNewMatch = (id: number) => {
  return http.request("delete", `/api/new-matches/${id}`);
};

/**
 * 上传新赛事CSV文件
 * @param formData 包含文件的FormData
 * @returns 上传结果
 */
export const uploadNewMatchesCsv = (formData: FormData) => {
  return http.request("post", "/api/new-matches/upload", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/**
 * 获取赛事推荐列表
 * @param params 查询参数，包含page和limit等
 * @returns 赛事推荐列表
 */
export const getMatchRecommendations = (params?: { page?: number; limit?: number }) => {
  return http.request("get", "/api/match-recommendations", { params });
};
/**
 * 创建新赛事推荐
 * @param data 比赛数据
 * @returns 创建的比赛信息
 */
export const createMatchRec = (data: Object) => {
  return http.request("post", "/api/match-recommendations", { data });
};

/**
 * 更新投注详情
 * @param id 投注详情ID
 * @param data 更新的数据
 * @returns 更新结果
 */
export const updateBettingDetail = (
  id: number,
  data: {
    jingcai_number?: string;
    beidan_number?: string;
    jingcai_handicap?: number;
    beidan_handicap?: number;
    win?: number;
    draw?: number;
    lose?: number;
    home_win_rate?: number;
    away_win_rate?: number;
    recommended_result?: string;
    status?: string;
    notes?: string;
  }
) => {
  return http.request("put", `/api/betting-details/${id}`, { data });
};

/**
 * 删除投注详情
 * @param id 投注详情ID
 * @returns 删除结果
 */
export const deleteBettingDetail = (id: number) => {
  return http.request("delete", `/api/betting-details/${id}`);
};

/**
 * 确认推荐
 * @param id 投注详情ID
 * @returns 确认结果
 */
export const confirmRecommendation = (id: number) => {
  return http.request("put", `/api/betting-details/${id}/confirm`);
};

/**
 * 创建投注详情
 * @param data 投注详情数据
 * @returns 创建的投注详情
 */
export const createBettingDetail = (data: {
  match_id: number;
  jingcai_number: string;
  beidan_number: string;
  jingcai_handicap: number;
  beidan_handicap: number;
  win: number;
  draw: number;
  lose: number;
  home_win_rate: number;
  away_win_rate: number;
  recommended_result: string;
  status: string;
  notes: string;
}) => {
  return http.request("post", "/api/betting-details", { data });
};
