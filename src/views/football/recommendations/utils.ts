/**
 * 格式化状态类型
 */
export const getStatusType = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "recommended":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
};

/**
 * 格式化状态文本
 */
export const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待推荐";
    case "recommended":
      return "已推荐";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return "未知";
  }
};

/**
 * 格式化推荐类型
 */
export const getRecommendationType = (result: string) => {
  switch (result) {
    case "胜":
      return "success";
    case "平":
      return "warning";
    case "负":
      return "danger";
    default:
      return "primary";
  }
};

/**
 * 格式化日期时间
 */
export const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};
