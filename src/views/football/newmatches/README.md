# 新赛事导入功能

## 功能概述

新赛事导入页面是基于原有赛事导入功能开发的增强版本，提供了更详细的投注信息展示和管理功能。

## 主要特性

### 1. 数据展示
- **一行一比赛**: 每条比赛记录占据表格一行
- **支持展开**: 点击展开按钮可查看该比赛的详细投注信息
- **投注详情**: 展开后显示竞彩编号、北单编号、让球数据、赔率信息等

### 2. 核心功能
- **文件上传**: 支持CSV、XLS、XLSX格式文件上传
- **数据筛选**: 按联赛、导入状态、日期范围、球队进行筛选
- **记录编辑**: 支持修改比赛基本信息
- **球队信息引入**: 自动创建球队信息到系统中
- **赛事推送**: 将导入的比赛数据推送到赛事安排系统

### 3. 数据结构

#### 比赛记录字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 比赛导入记录ID |
| match_time | String | 比赛开赛时间（yyyy-MM-dd hh-mm） |
| league | String | 联赛名称 |
| home_team | String | 主队名称 |
| away_team | String | 客队名称 |
| match_unique_key | String | 比赛唯一标识（时间+联赛+队伍） |
| home_extra | String | 主队附加信息 |
| away_extra | String | 客队附加信息 |
| file_name | String | 源文件名称 |
| import_status | String | 导入状态（success、failed、processing） |
| betting_count | Number | 该场比赛投注详情数量 |
| created_at | String | 创建时间（ISO格式） |
| bettingDetails | Array | 投注详情数组 |

#### 投注详情字段
| 字段 | 类型 | 说明 |
|------|------|------|
| jingcai_number | String | 竞彩编号 |
| beidan_number | String | 北单编号 |
| jingcai_handicap | Number | 竞彩让球 |
| beidan_handicap | Number | 北单让球 |
| win | Number | 胜的赔率 |
| draw | Number | 平的赔率 |
| lose | Number | 负的赔率 |
| betting_type_desc | String | 投注方案描述 |
| sort_order | Number | 投注排序 |
| remark | String | 备注（预留） |

## API接口

### 1. 获取记录列表
```
GET /api/new-matches
```
**参数**: 
- page: 页码
- limit: 每页数量

**响应**:
```json
{
  "data": [比赛记录数组],
  "total": 总记录数,
  "page": 当前页码,
  "limit": 每页返回记录数量
}
```

### 2. 上传文件
```
POST /api/new-matches/upload
```
**参数**: FormData包含文件

### 3. 更新记录
```
PUT /api/new-matches/{id}
```
**参数**: 更新的比赛信息

### 4. 删除记录
```
DELETE /api/new-matches/{id}
```

## 使用说明

### 1. 文件上传
1. 点击"上传CSV文件"按钮
2. 选择符合格式的CSV、XLS或XLSX文件
3. 文件上传后自动解析并显示在列表中

### 2. 查看投注详情
1. 找到要查看的比赛记录
2. 点击该行前面的展开按钮（▶）
3. 查看详细的投注信息表格

### 3. 编辑比赛信息
1. 点击操作列的"修改"按钮
2. 在弹出的对话框中修改比赛信息
3. 点击"确定"保存修改

### 4. 球队信息引入
1. 点击"球队信息引入"按钮
2. 系统会自动根据球队名称获取LOGO等信息
3. 创建或更新球队信息到系统中

### 5. 推送赛事安排
1. 确保相关球队已存在于系统中
2. 点击"推送赛事"按钮
3. 系统会将比赛信息推送到赛事安排模块

## 文件结构

```
src/views/football/newmatches/
├── index.vue          # 主页面组件
└── types.ts          # 类型定义文件
```

## 技术栈

- Vue 3 + TypeScript
- Element Plus UI组件库
- Axios HTTP客户端
- SCSS样式预处理器

## 样式特性

- 响应式布局
- 阴影和圆角设计
- 状态标签颜色区分
- 展开行高亮显示
- 分页组件居中对齐

## 注意事项

1. 上传文件大小限制为10MB
2. 支持的文件格式：CSV、XLS、XLSX
3. 比赛时间格式需要符合：yyyy-MM-dd hh:mm
4. 推送赛事前需要确保球队信息已存在
5. 展开行会显示该比赛的所有投注详情
