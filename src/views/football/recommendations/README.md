# 赛事推荐功能

## 功能概述

赛事推荐页面用于展示和管理足球比赛的推荐信息，包括比赛基本信息和详细的投注建议。页面采用合并单元格的表格形式，清晰地展示比赛记录和对应的多条投注详情。

## 主要特性

### 1. 数据展示
- **合并单元格显示**: 比赛基本信息占据一行，对应的投注详情在下方多行展示
- **完整信息展示**: 包含比赛时间、球队、胜率、投注编号、赔率、推荐结果等
- **状态标识**: 通过不同颜色的标签显示比赛状态和推荐状态

### 2. 核心功能
- **数据筛选**: 按联赛、状态、日期范围、球队进行筛选
- **投注详情编辑**: 支持修改投注详情的各项参数
- **推荐确认**: 确认推荐结果并更新状态
- **投注详情管理**: 添加、编辑、删除投注详情
- **实时刷新**: 手动刷新最新数据

### 3. 数据结构

#### API接口
```
GET /api/match-recommendations
```

#### 响应结构
```json
{
  "data": [
    {
      "id": 0,
      "match_time": "string",
      "league": "string", 
      "home_team": "string",
      "away_team": "string",
      "home_win_rate": 0,
      "away_win_rate": 0,
      "status": "string",
      "notes": "string",
      "created_at": "2025-07-02T05:28:37.200Z",
      "updated_at": "2025-07-02T05:28:37.200Z",
      "betting_details": [
        {
          "id": 0,
          "jingcai_number": "string",
          "beidan_number": "string", 
          "jingcai_handicap": 0,
          "beidan_handicap": 0,
          "win": 0,
          "draw": 0,
          "lose": 0,
          "home_win_rate": 0,
          "away_win_rate": 0,
          "recommended_result": "string",
          "status": "string",
          "notes": "string",
          "created_at": "2025-07-02T05:28:37.200Z",
          "updated_at": "2025-07-02T05:28:37.200Z"
        }
      ]
    }
  ],
  "total": 0,
  "page": 0,
  "limit": 0
}
```

#### 字段说明

**比赛记录字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 比赛ID |
| match_time | String | 比赛时间 |
| league | String | 联赛名称 |
| home_team | String | 主队名称 |
| away_team | String | 客队名称 |
| home_win_rate | Number | 主队胜率（0-1） |
| away_win_rate | Number | 客队胜率（0-1） |
| status | String | 比赛状态 |
| notes | String | 比赛备注 |
| created_at | String | 创建时间 |
| updated_at | String | 更新时间 |
| betting_details | Array | 投注详情数组 |

**投注详情字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 投注详情ID |
| jingcai_number | String | 竞彩编号 |
| beidan_number | String | 北单编号 |
| jingcai_handicap | Number | 竞彩让球 |
| beidan_handicap | Number | 北单让球 |
| win | Number | 胜赔率 |
| draw | Number | 平赔率 |
| lose | Number | 负赔率 |
| home_win_rate | Number | 投注主队胜率 |
| away_win_rate | Number | 投注客队胜率 |
| recommended_result | String | 推荐结果 |
| status | String | 投注状态 |
| notes | String | 投注备注 |

## 功能说明

### 1. 表格展示
- **合并单元格**: 比赛基本信息（时间、联赛、球队等）在有多条投注详情时会合并显示
- **多行投注**: 每条投注详情占据一行，包含完整的投注信息
- **操作按钮**: 每行投注详情都有独立的操作按钮

### 2. 状态管理
**比赛状态**:
- `pending`: 待推荐（橙色）
- `recommended`: 已推荐（蓝色）
- `completed`: 已完成（绿色）
- `cancelled`: 已取消（红色）

**投注状态**:
- `pending`: 待推荐
- `recommended`: 已推荐
- `completed`: 已完成
- `cancelled`: 已取消

### 3. 操作功能

#### 编辑投注详情
1. 点击"编辑"按钮打开编辑对话框
2. 修改投注参数（编号、让球、赔率等）
3. 更新推荐结果和状态
4. 保存修改

#### 确认推荐
1. 点击"确认推荐"按钮
2. 系统提示确认操作
3. 更新投注状态为已推荐

#### 删除投注详情
1. 点击"删除"按钮
2. 确认删除操作
3. 从列表中移除该投注详情

#### 添加投注详情
1. 对于没有投注详情的比赛，显示"添加投注"按钮
2. 点击打开编辑对话框
3. 填写新的投注详情信息

### 4. 筛选功能
- **联赛筛选**: 从下拉列表选择特定联赛
- **状态筛选**: 按比赛或投注状态筛选
- **日期范围**: 选择比赛时间范围
- **球队搜索**: 输入球队名称进行搜索

## 技术实现

### 1. 合并单元格实现
```javascript
const handleSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  const mergeColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 比赛信息列
  
  if (mergeColumns.includes(columnIndex)) {
    if (row.isFirstRow && row.rowSpan > 1) {
      return { rowspan: row.rowSpan, colspan: 1 };
    } else if (!row.isFirstRow) {
      return { rowspan: 0, colspan: 0 };
    }
  }
  
  return { rowspan: 1, colspan: 1 };
};
```

### 2. 数据结构转换
将嵌套的比赛数据转换为扁平化的表格数据，支持合并单元格显示。

### 3. 响应式设计
- 表格支持横向滚动
- 固定右侧操作列
- 自适应不同屏幕尺寸

## 使用说明

### 1. 访问页面
在浏览器中访问：`/football/recommendations`

### 2. 查看数据
- 表格显示所有比赛和对应的投注详情
- 比赛基本信息在多行投注中只显示一次（合并单元格）
- 每行投注详情显示完整的投注信息

### 3. 管理投注
- 编辑：修改投注详情参数
- 确认：确认推荐结果
- 删除：移除不需要的投注详情
- 添加：为比赛添加新的投注建议

### 4. 筛选数据
使用顶部筛选表单按不同条件筛选显示的数据。

## 文件结构

```
src/views/football/recommendations/
├── index.vue          # 主页面组件
└── types.ts          # 类型定义文件
```

## 注意事项

1. 表格使用合并单元格，比赛信息只在第一行显示
2. 每条投注详情都可以独立操作
3. 确认推荐后状态不可逆转
4. 删除投注详情会影响表格合并单元格的显示
5. 页面包含模拟数据，实际使用时连接真实API
