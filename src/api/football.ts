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
