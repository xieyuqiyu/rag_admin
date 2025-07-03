import axios from "axios";
import type { MatchRecommendation } from "./types";

/**
 * 获取赛事推荐列表
 */
export const fetchMatchRecommendations = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axios.get("/api/match-recommendations", {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("获取赛事推荐列表失败:", error);
    throw error;
  }
};

/**
 * 更新投注详情
 */
export const updateBettingDetail = async (id: number, data: any) => {
  try {
    await axios.patch(`/api/match-recommendations/betting-details/${id}`, data);
  } catch (error) {
    console.error("更新投注详情失败:", error);
    throw error;
  }
};

/**
 * 创建投注详情
 */
export const createBettingDetail = async (data: any) => {
  try {
    await axios.post("/api/match-recommendations/betting-details", data);
  } catch (error) {
    console.error("创建投注详情失败:", error);
    throw error;
  }
};

/**
 * 确认推荐
 */
export const confirmRecommendation = async (id: number) => {
  try {
    await axios.put(`/api/match-recommendations/betting-details/${id}/confirm`);
  } catch (error) {
    console.error("确认推荐失败:", error);
    throw error;
  }
};

/**
 * 删除投注详情
 */
export const deleteBettingDetail = async (id: number) => {
  try {
    await axios.delete(`/api/match-recommendations/betting-details/${id}`);
  } catch (error) {
    console.error("删除投注详情失败:", error);
    throw error;
  }
};

/**
 * 删除比赛推荐记录（主数据）
 */
export const deleteMatchRecommendation = async (id: number) => {
  try {
    await axios.delete(`/api/match-recommendations/${id}`);
  } catch (error) {
    console.error("删除比赛推荐记录失败:", error);
    throw error;
  }
};

/**
 * 更新比赛胆推荐
 */
export const updateBoldRecommendation = async (
  id: number,
  boldRecommendation: string
) => {
  try {
    await axios.patch(`/api/match-recommendations/${id}/bold-recommendation`, {
      bold_recommendation: boldRecommendation
    });
  } catch (error) {
    console.error("更新胆推荐失败:", error);
    throw error;
  }
};

/**
 * 获取模拟数据
 */
export const getMockData = (): MatchRecommendation[] => {
  return [
    {
      id: 1,
      match_time: "2025-07-15 20:00:00",
      league: "中超",
      home_team: "山东泰山",
      away_team: "上海海港",
      home_win_rate: 0.65,
      away_win_rate: 0.35,
      status: "pending",
      notes: "重要比赛",
      created_at: "2025-07-02T10:30:00Z",
      updated_at: "2025-07-02T10:30:00Z",
      betting_details: [
        {
          id: 1,
          jingcai_number: "001",
          beidan_number: "B001",
          jingcai_handicap: 0.5,
          beidan_handicap: 0,
          win: 1.85,
          draw: 3.2,
          lose: 4.5,
          home_win_rate: 0.68,
          away_win_rate: 0.32,
          recommended_result: ["win", "draw"],
          status: "recommended",
          notes: "主队优势明显",
          created_at: "2025-07-02T10:30:00Z",
          updated_at: "2025-07-02T10:30:00Z"
        },
        {
          id: 2,
          jingcai_number: "002",
          beidan_number: "B002",
          jingcai_handicap: -0.5,
          beidan_handicap: -1,
          win: 2.1,
          draw: 3.0,
          lose: 3.8,
          home_win_rate: 0.62,
          away_win_rate: 0.38,
          recommended_result: "win",
          status: "pending",
          notes: "让球推荐",
          created_at: "2025-07-02T10:30:00Z",
          updated_at: "2025-07-02T10:30:00Z"
        }
      ]
    },
    {
      id: 2,
      match_time: "2025-07-16 19:30:00",
      league: "中超",
      home_team: "北京国安",
      away_team: "广州城",
      home_win_rate: 0.45,
      away_win_rate: 0.55,
      status: "recommended",
      notes: "",
      created_at: "2025-07-02T11:00:00Z",
      updated_at: "2025-07-02T11:00:00Z",
      betting_details: [
        {
          id: 3,
          jingcai_number: "003",
          beidan_number: "B003",
          jingcai_handicap: 1,
          beidan_handicap: 0.5,
          win: 1.65,
          draw: 3.4,
          lose: 5.2,
          home_win_rate: 0.48,
          away_win_rate: 0.52,
          recommended_result: "lose",
          status: "completed",
          notes: "客队状态更佳",
          created_at: "2025-07-02T11:00:00Z",
          updated_at: "2025-07-02T11:00:00Z"
        }
      ]
    }
  ];
};
