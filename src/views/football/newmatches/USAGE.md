# 新赛事导入页面 - 使用示例

## 快速开始

### 1. 访问页面
在浏览器中访问：`/football/newmatches`

### 2. 模拟数据
页面已包含模拟数据，可以直接体验功能：

#### 示例数据结构
```javascript
// 比赛记录示例
{
  id: 1,
  match_time: "2025-07-15 20:00",
  league: "中超",
  home_team: "山东泰山",
  away_team: "上海海港",
  match_unique_key: "2025-07-15_中超_山东泰山_上海海港",
  home_extra: "主场优势",
  away_extra: "客场作战",
  file_name: "matches_2025_07_15.csv",
  import_status: "success",
  betting_count: 3,
  created_at: "2025-07-02T10:30:00Z",
  bettingDetails: [
    {
      jingcai_number: "001",
      beidan_number: "B001",
      jingcai_handicap: 0.5,
      beidan_handicap: 0,
      win: 1.85,
      draw: 3.20,
      lose: 4.50,
      betting_type_desc: "胜平负",
      sort_order: 1,
      remark: ""
    }
    // ... 更多投注详情
  ]
}
```

### 3. 功能演示

#### 展开投注详情
1. 在表格中找到比赛记录
2. 点击行首的展开按钮（▶）
3. 查看该比赛的所有投注详情

#### 筛选功能
```javascript
// 筛选条件示例
filterForm = {
  team: "山东泰山",           // 按球队筛选
  status: "success",          // 按导入状态筛选
  dateRange: ["2025-07-01", "2025-07-31"], // 按日期范围筛选
  league: "中超"              // 按联赛筛选
}
```

#### 编辑比赛信息
```javascript
// 编辑表单数据结构
editForm = {
  id: 1,
  match_time: "2025-07-15 20:00",
  league: "中超",
  home_team: "山东泰山",
  away_team: "上海海港",
  match_unique_key: "2025-07-15_中超_山东泰山_上海海港",
  home_extra: "主场优势",
  away_extra: "客场作战"
}
```

### 4. CSV文件格式示例

```csv
match_time,league,home_team,away_team,home_extra,away_extra,jingcai_number,beidan_number,jingcai_handicap,beidan_handicap,win,draw,lose,betting_type_desc
2025-07-15 20:00,中超,山东泰山,上海海港,主场优势,客场作战,001,B001,0.5,0,1.85,3.20,4.50,胜平负
2025-07-15 20:00,中超,山东泰山,上海海港,主场优势,客场作战,002,B002,-0.5,-1,2.10,3.00,3.80,让球胜平负
```

### 5. 状态说明

#### 导入状态
- `success`: 导入成功（绿色标签）
- `failed`: 导入失败（红色标签）
- `processing`: 处理中（橙色标签）

#### 操作按钮
- **球队信息引入**: 自动创建球队信息到系统
- **修改**: 编辑比赛基本信息
- **推送赛事**: 将比赛推送到赛事安排系统

### 6. 响应式设计

页面支持不同屏幕尺寸：
- 桌面端：完整功能显示
- 平板端：自适应列宽
- 移动端：滚动查看

### 7. 错误处理

页面包含完善的错误处理机制：
- 文件上传失败提示
- 网络请求异常处理
- 表单验证错误提示
- API调用失败回退

### 8. 性能优化

- 计算属性缓存筛选结果
- 分页加载减少数据量
- 懒加载展开内容
- 防抖处理用户输入

## 开发说明

### 组件结构
```
NewMatchesPage
├── HeaderSection (上传按钮)
├── FilterSection (筛选表单)
├── TableContainer (数据表格)
│   ├── ExpandableRows (展开行)
│   └── PaginationComponent (分页)
└── EditDialog (编辑对话框)
```

### 数据流
```
API → Store → Component → UI
```

### 事件处理
- 文件上传：`beforeUpload` → `onUploadSuccess` → `fetchMatchRecords`
- 数据筛选：`handleFilter` → `computed(filteredMatchRecords)`
- 记录编辑：`handleEditMatch` → `handleSaveEdit` → 更新本地数据
- 行展开：`handleExpandChange` → 更新展开状态
