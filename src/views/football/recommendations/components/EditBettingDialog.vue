<template>
  <el-dialog
    v-model="visible"
    title="编辑投注详情"
    width="800px"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="竞彩编号" prop="jingcai_number">
            <el-input
              v-model="form.jingcai_number"
              placeholder="请输入竞彩编号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="北单编号" prop="beidan_number">
            <el-input
              v-model="form.beidan_number"
              placeholder="请输入北单编号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="竞彩让球" prop="jingcai_handicap">
            <el-input-number
              v-model="form.jingcai_handicap"
              :precision="1"
              :step="0.5"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="北单让球" prop="beidan_handicap">
            <el-input-number
              v-model="form.beidan_handicap"
              :precision="1"
              :step="0.5"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="胜赔率" prop="win">
            <el-input-number
              v-model="form.win"
              :precision="2"
              :step="0.01"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="平赔率" prop="draw">
            <el-input-number
              v-model="form.draw"
              :precision="2"
              :step="0.01"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="负赔率" prop="lose">
            <el-input-number
              v-model="form.lose"
              :precision="2"
              :step="0.01"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="主队胜率" prop="home_win_rate">
            <el-input-number
              v-model="form.home_win_rate"
              :precision="3"
              :step="0.001"
              :min="0"
              :max="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客队胜率" prop="away_win_rate">
            <el-input-number
              v-model="form.away_win_rate"
              :precision="3"
              :step="0.001"
              :min="0"
              :max="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="推荐结果" prop="recommended_result">
            <el-select v-model="form.recommended_result" style="width: 100%">
              <el-option label="胜" value="胜" />
              <el-option label="平" value="平" />
              <el-option label="负" value="负" />
              <el-option label="胜平" value="胜平" />
              <el-option label="胜负" value="胜负" />
              <el-option label="平负" value="平负" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" style="width: 100%">
              <el-option label="待推荐" value="pending" />
              <el-option label="已推荐" value="recommended" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { FormInstance } from "element-plus";
import type { TableRowData } from "../types";

interface EditForm {
  id: number;
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
}

interface Props {
  modelValue: boolean;
  loading?: boolean;
  rowData?: TableRowData | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: EditForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowData: null
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const visible = ref(false);

const form = reactive<EditForm>({
  id: 0,
  jingcai_number: "",
  beidan_number: "",
  jingcai_handicap: 0,
  beidan_handicap: 0,
  win: 0,
  draw: 0,
  lose: 0,
  home_win_rate: 0,
  away_win_rate: 0,
  recommended_result: "",
  status: "",
  notes: ""
});

const rules = {
  jingcai_number: [
    { required: true, message: "请输入竞彩编号", trigger: "blur" }
  ],
  beidan_number: [
    { required: true, message: "请输入北单编号", trigger: "blur" }
  ],
  recommended_result: [
    { required: true, message: "请选择推荐结果", trigger: "change" }
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

// 监听modelValue变化
watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal;
    if (newVal && props.rowData) {
      // 编辑模式，填充表单数据
      fillFormData();
    } else if (newVal) {
      // 新增模式，重置表单
      resetForm();
    }
  },
  { immediate: true }
);

// 监听visible变化
watch(visible, newVal => {
  emit("update:modelValue", newVal);
});

// 填充表单数据（编辑模式）
const fillFormData = () => {
  if (!props.rowData?.betting_id) return;

  form.id = props.rowData.betting_id;
  form.jingcai_number = props.rowData.jingcai_number || "";
  form.beidan_number = props.rowData.beidan_number || "";
  form.jingcai_handicap = props.rowData.jingcai_handicap || 0;
  form.beidan_handicap = props.rowData.beidan_handicap || 0;
  form.win = props.rowData.win || 0;
  form.draw = props.rowData.draw || 0;
  form.lose = props.rowData.lose || 0;
  form.home_win_rate = props.rowData.betting_home_win_rate || 0;
  form.away_win_rate = props.rowData.betting_away_win_rate || 0;
  form.recommended_result = props.rowData.recommended_result || "";
  form.status = props.rowData.betting_status || "";
  form.notes = props.rowData.betting_notes || "";
};

// 重置表单（新增模式）
const resetForm = () => {
  form.id = 0;
  form.jingcai_number = "";
  form.beidan_number = "";
  form.jingcai_handicap = 0;
  form.beidan_handicap = 0;
  form.win = 0;
  form.draw = 0;
  form.lose = 0;
  form.home_win_rate = 0;
  form.away_win_rate = 0;
  form.recommended_result = "";
  form.status = "pending";
  form.notes = "";
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("save", { ...form });
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

// 关闭
const handleClose = () => {
  formRef.value?.resetFields();
  emit("update:modelValue", false);
};
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    text-align: right;
  }
}
</style>
