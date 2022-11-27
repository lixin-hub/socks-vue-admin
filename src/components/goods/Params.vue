<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
<!--      &lt;!&ndash; 警告区域 &ndash;&gt;-->
<!--      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>-->

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activityType" @tab-click="handleTabsClick">
        <!-- 参数面板 -->
        <el-tab-pane label="商品参数" name="0">
          <el-button
              :disabled="isBtnDisabled"
              size="mini"
              type="primary"
              @click="addDialogVisible = true"
          >添加参数
          </el-button>
          <!-- 参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                    v-for="(item, i) in scope.row.value"
                    :key="i"
                    closable
                    @close="handleClose(i, scope.row)"
                >{{ item }}
                </el-tag>
                <!-- 输入Tag文本框 -->
                <el-input
                    v-if="scope.row.inputVisible"
                    ref="saveTagInput"
                    v-model="scope.row.inputValue"
                    class="input-new-tag"
                    size="small"
                    @blur="handleInputConfirm(scope.row)"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                >+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="name"></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-button
                    icon="el-icon-edit"
                    size="mini"
                    type="primary"
                    @click="showEditDialog(scope.row.id)"
                >编辑
                </el-button>
                <el-button
                    icon="el-icon-delete"
                    size="mini"
                    type="danger"
                    @click="removeParams(scope.row.id)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 属性面板 -->
        <el-tab-pane label="商品属性" name="1">
          <el-button
              :disabled="isBtnDisabled"
              size="mini"
              type="primary"
              @click="addDialogVisible = true"
          >添加属性
          </el-button>
          <!-- 属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                    v-for="(item, i) in scope.row.value"
                    :key="i"
                    closable
                    @close="handleClose(i, scope.row)"
                >{{ item }}
                </el-tag>
                <!-- 输入Tag文本框 -->
                <el-input
                    v-if="scope.row.inputVisible"
                    ref="saveTagInput"
                    v-model="scope.row.inputValue"
                    class="input-new-tag"
                    size="small"
                    @blur="handleInputConfirm(scope.row)"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                >+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="name"></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-button
                    icon="el-icon-edit"
                    size="mini"
                    type="primary"
                    @click="showEditDialog(scope.row.id)"
                >编辑
                </el-button>
                <el-button
                    icon="el-icon-delete"
                    size="mini"
                    type="danger"
                    @click="removeParams(scope.row.id)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
        :title=" '添加' + getTitleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
    >
      <el-form ref="addFromRef" :model="addFrom" :rules="addFromRules" label-width="100px">
        <el-form-item :label="getTitleText" prop="name">
          <el-input v-model="addFrom.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
        :title=" '修改' + getTitleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
    >
      <el-form ref="editFromRef" :model="editFrom" :rules="editFromRules" label-width="100px">
        <el-form-item :label="getTitleText" prop="name">
          <el-input v-model="editFrom.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodParams",
  data() {
    return {
      // 商品分类列表
      cateList: [],
      //   级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: 'true'
      },
      //   级联选择框双向绑定对象
      selectedCateKeys: [],
      //   激活页签名称 0:参数 1:属性
      activityType: '0',
      //   动态参数数据
      manyTableData: [],
      //   静态属性数据
      onlyTableData: [],
      //   控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      //   添加表单的数据对象
      addFrom: {
        name: ''
      },
      //   添加表单的验证规则
      addFromRules: {
        name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'}
        ]
      },
      //   编辑对话框
      editDialogVisible: false,
      //   修改表单数据对象
      editFrom: {},
      //   修改表单验证规则
      editFromRules: {
        name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    //   按钮需要被禁用返回true, 否则返回false
    isBtnDisabled() {
      return this.selectedCateKeys.length ===0;
    },
    // 当前选中的三级分类Id
    getCateId() {
      if (this.selectedCateKeys.length >0) {
        return this.selectedCateKeys[this.selectedCateKeys.length-1]
      }
      return null
    },
    getTitleText() {
      if (this.activityType === '0') {
        return '参数'
      }
      return '属性'
    }
  },
  methods: {
    //   获取所有的商品分类列表
    async getCateList() {
      const {data: res} = await this.$http.post('/good/category/page', {
        page: {
          size: 1000,
          current: 1
        }
      })

      if (!res.status) {
        return this.$message.error('获取商品列表失败！')
      }
      this.cateList = res.page.records
    },
    // 级联选择框 选中变化 触发
    handleChange() {
      this.getParamsData()
    },
    // Tab页签点击事件的处理函数
    handleTabsClick() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 只允许选择三级分类：
      // 通过数组的长度判断
      if (this.selectedCateKeys.length===0) {
        this.selectedCateKeys = []
        // 清空表格数据
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //   根据所选分类的Id,和当前面板的参数, 获取对应的参数
      const {data: res} = await this.$http.get(
          `/good/attribute/${this.activityType}/${this.getCateId}/list`,
      )
      if (!res.status) {
        return this.$message.error('获取参数列表失败！')
      }
      res.data.forEach(item => {
        //   通过三元表达式判断value是否为空
        item.value = item.value ? item.value.split(' ') : []

        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框的输入值
        item.inputValue = ''
      })
      if (this.activityType === '0') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFromRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post(
            "/good/attribute/insert",
            {
              name: this.addFrom.name,
              attrType: this.activityType,
              catId: this.getCateId
            }
        )
        if (!res.status) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        await this.getParamsData()
      })
    },
    // 显示编辑对话框
    async showEditDialog(attrId) {
      const {data: res} = await this.$http.get(
          `/good/attribute/${attrId}`
      )
      if (!res.status) {
        return this.$message.error('获取分类失败！')
      }
      this.editFrom = res.data
      this.editDialogVisible = true
    },
    // 重置修改表单
    editDialogClosed() {
      this.$refs.editFromRef.resetFields()
    },
    // 修改参数
    editParams() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post(
            `/good/attribute/updateById`,
            {
              id:this.editFrom.id,
              name: this.editFrom.name,
              attrType: this.activityType
            }
        )
        if (!res.status) {
          return this.$message.error(res.message)
        }
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据Id删除对应的参数项
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该参数, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const {data: res} = await this.$http.get(
          `/good/attribute/delete/${attrId}`
      )
      if (!res.status) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 文本框失去焦点,或者按下Enter触发
    handleInputConfirm(row) {
      // 输入的内容为空时，清空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.value.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 提交数据库，保存修改
      this.saveAttrVals(row)
    },
    // 将对value（Tag） 的操作 保存到数据库
    async saveAttrVals(row) {
      const {data: res} = await this.$http.post(
          "/good/attribute/insert",
          {
            id: row.id,
            name: row.name,
            attrType: row.attrType,
            value: row.value.join(' '),
            catId: this.getCateId,
          }
      )
      if (!res.status) {
        return this.$message.error(res.message)
      }
      this.$message.success('修改参数项成功！')
    },
    // 点击按钮显示输入框
    showInput(row) {
      row.inputVisible = true
      //   让输入框自动获取焦点
      // $nextTick方法的作用：当页面元素被重新渲染之后，才会至指定回调函数中的代码
      // eslint-disable-next-line no-unused-vars
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.value.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-cascader {
  width: 25%;
}

.el-tag {
  margin: 8px;
}

.input-new-tag {
  width: 90px;
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
