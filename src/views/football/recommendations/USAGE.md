# 赛事推荐页面 - 使用示例

## 快速开始

### 1. 访问页面
在浏览器中访问：`/football/recommendations`

### 2. 页面功能演示

#### 表格展示效果
```
+-------------+------+--------+--------+----------+----------+--------+
| 比赛时间    | 联赛 | 主队   | 客队   | 主队胜率 | 客队胜率 | 状态   |
+-------------+------+--------+--------+----------+----------+--------+
| 2025-07-15  | 中超 | 山东   | 上海   | 65.0%    | 35.0%    | 待推荐 |
| 20:00       |      | 泰山   | 海港   |          |          |        |
|             |      |        |        |          |          |        |
|             |      |        |        |          |          |        |
+-------------+------+--------+--------+----------+----------+--------+
```

*注：比赛基本信息使用合并单元格显示，投注详情在右侧多行展示*

### 3. 模拟数据结构

#### 比赛数据示例
```javascript
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
  betting_details: [
    {
      id: 1,
      jingcai_number: "001",
      beidan_number: "B001",
      jingcai_handicap: 0.5,
      beidan_handicap: 0,
      win: 1.85,
      draw: 3.20,
      lose: 4.50,
      home_win_rate: 0.68,
      away_win_rate: 0.32,
      recommended_result: "胜",
      status: "recommended",
      notes: "主队优势明显"
    },
    {
      id: 2,
      jingcai_number: "002", 
      beidan_number: "B002",
      jingcai_handicap: -0.5,
      beidan_handicap: -1,
      win: 2.10,
      draw: 3.00,
      lose: 3.80,
      home_win_rate: 0.62,
      away_win_rate: 0.38,
      recommended_result: "胜",
      status: "pending",
      notes: "让球推荐"
    }
  ]
}
```

### 4. 操作流程示例

#### 编辑投注详情
```javascript
// 1. 点击"编辑"按钮
handleEditBetting(row)

// 2. 编辑表单数据
editForm = {
  id: 1,
  jingcai_number: "001",
  beidan_number: "B001", 
  jingcai_handicap: 0.5,
  beidan_handicap: 0,
  win: 1.85,
  draw: 3.20,
  lose: 4.50,
  home_win_rate: 0.68,
  away_win_rate: 0.32,
  recommended_result: "胜",
  status: "recommended",
  notes: "主队优势明显"
}

// 3. 保存修改
handleSaveEdit()
```

#### 确认推荐流程
```javascript
// 1. 点击"确认推荐"按钮
handleConfirmRecommendation(row)

// 2. 确认对话框
ElMessageBox.confirm("确定要确认推荐 胜 吗？")

// 3. API调用
axios.put(`/api/betting-details/${row.betting_id}/confirm`)

// 4. 更新状态并刷新数据
```

#### 筛选功能演示
```javascript
// 筛选条件
filterForm = {
  league: "中超",           // 按联赛筛选
  status: "pending",       // 按状态筛选  
  dateRange: ["2025-07-01", "2025-07-31"], // 按日期范围
  team: "山东泰山"         // 按球队筛选
}

// 应用筛选
handleFilter()
```

### 5. 合并单元格实现原理

#### 数据转换过程
```javascript
// 原始数据（嵌套结构）
const originalData = [
  {
    id: 1,
    match_time: "2025-07-15 20:00:00",
    home_team: "山东泰山",
    betting_details: [
      { id: 1, jingcai_number: "001" },
      { id: 2, jingcai_number: "002" }
    ]
  }
]

// 转换后的表格数据（扁平结构）
const tableData = [
  {
    matchId: 1,
    match_time: "2025-07-15 20:00:00", 
    home_team: "山东泰山",
    betting_id: 1,
    jingcai_number: "001",
    isFirstRow: true,   // 第一行标记
    rowSpan: 2         // 合并2行
  },
  {
    matchId: 1,
    match_time: "2025-07-15 20:00:00",
    home_team: "山东泰山", 
    betting_id: 2,
    jingcai_number: "002",
    isFirstRow: false,  // 非第一行
    rowSpan: 0         // 不合并
  }
]
```

#### 合并单元格规则
```javascript
const handleSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 比赛信息列需要合并（0-8列）
  const mergeColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  
  if (mergeColumns.includes(columnIndex)) {
    if (row.isFirstRow && row.rowSpan > 1) {
      // 第一行且有多行：合并单元格
      return { rowspan: row.rowSpan, colspan: 1 };
    } else if (!row.isFirstRow) {
      // 非第一行：隐藏单元格
      return { rowspan: 0, colspan: 0 };
    }
  }
  
  // 默认：正常显示
  return { rowspan: 1, colspan: 1 };
};
```

### 6. 状态管理

#### 状态颜色对应
```javascript
const getStatusType = (status) => {
  switch (status) {
    case "pending": return "warning";    // 橙色
    case "recommended": return "primary"; // 蓝色
    case "completed": return "success";   // 绿色
    case "cancelled": return "danger";    // 红色
    default: return "info";              // 灰色
  }
}
```

#### 推荐结果颜色
```javascript
const getRecommendationType = (result) => {
  switch (result) {
    case "胜": return "success";  // 绿色
    case "平": return "warning";  // 橙色  
    case "负": return "danger";   // 红色
    default: return "primary";   // 蓝色
  }
}
```

### 7. 响应式布局

#### 表格滚动配置
```scss
.table-container {
  overflow-x: auto;
  
  :deep(.el-table) {
    min-width: 1200px; // 最小宽度
    
    .el-table__fixed-right {
      right: 0 !important; // 固定右侧操作列
    }
  }
}
```

#### 移动端适配
```scss
@media (max-width: 768px) {
  .match-recommendations-container {
    padding: 10px;
    
    .filter-section {
      .el-form--inline .el-form-item {
        display: block;
        margin-bottom: 10px;
      }
    }
    
    .header-section {
      flex-direction: column;
      gap: 10px;
    }
  }
}
```

### 8. 性能优化

#### 虚拟滚动（大数据量）
```javascript
// 如果数据量很大，可以考虑使用虚拟滚动
const virtualizedTable = {
  itemSize: 50,      // 每行高度
  bufferSize: 5,     // 缓冲区大小
  visibleCount: 20   // 可见行数
}
```

#### 防抖搜索
```javascript
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((keyword) => {
  fetchRecommendations(1, pagination.limit, { keyword })
}, 300)
```

### 9. 错误处理

#### API错误处理
```javascript
try {
  const response = await axios.get("/api/match-recommendations")
  // 处理成功响应
} catch (error) {
  console.error("获取数据失败:", error)
  ElMessage.error("获取数据失败")
  
  // 使用模拟数据作为后备
  recommendations.value = mockData
}
```

#### 表单验证错误
```javascript
const editFormRules = {
  jingcai_number: [
    { required: true, message: "请输入竞彩编号", trigger: "blur" }
  ],
  recommended_result: [
    { required: true, message: "请选择推荐结果", trigger: "change" }
  ]
}
```

## 开发提示

### 1. 调试合并单元格
在浏览器开发者工具中，可以通过以下方式调试合并单元格：
```javascript
// 在控制台中查看表格数据结构
console.table(tableData.value)

// 检查合并单元格计算
tableData.value.forEach((row, index) => {
  console.log(`行${index}:`, {
    isFirstRow: row.isFirstRow,
    rowSpan: row.rowSpan,
    matchId: row.matchId
  })
})
```

### 2. 自定义合并规则
根据需要可以调整哪些列进行合并：
```javascript
// 只合并前4列（时间、联赛、主队、客队）
const mergeColumns = [0, 1, 2, 3]

// 或者根据列的prop名称判断
const shouldMerge = (columnIndex, column) => {
  const mergeProps = ['match_time', 'league', 'home_team', 'away_team']
  return mergeProps.includes(column.property)
}
```

### 3. 扩展功能建议
- 添加导出功能
- 实现批量操作
- 添加图表分析
- 集成推送通知
- 添加历史记录查看
