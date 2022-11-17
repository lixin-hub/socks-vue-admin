<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
          :columns="columns"
          :data="cateList"
          :expand-type="false"
          :selection-type="false"
          :show-row-hover="false"
          border
          :stripe="true"
          class="treeTable"
          index-text="#"
          show-index
      >
        <!-- 备注 -->
        <template  slot="note" slot-scope="scope">
          <label >{{ scope.row.note }}</label>
        </template>
        <!-- 排序 -->
        <template slot="level" slot-scope="scope" >
          <el-tag v-if="scope.row.level === '0'" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.level === '1'" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <template slot="createTime" slot-scope="scope">
          <label >{{scope.row.createTime | dataFormat}}</label>
        </template>
        <template slot="updateTime" slot-scope="scope">
          <label>{{scope.row.updateTime|dataFormat}}</label>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <div  class="ed-op">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditCateDialog(scope.row.id)">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeCate(scope.row.id)">删除</el-button>
          </div  >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
          :current-page="queryInfo.page.current"
          :page-size="queryInfo.page.size"
          :page-sizes="[1,3, 5, 10, 15]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog :visible.sync="addCateDialogVisible" title="添加分类" width="50%" @close="addCateDialogClosed">
      <el-form
          ref="addCateFormRef"
          :model="addCateForm"
          :rules="addCateFormRules"
          label-width="100px"
      >
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="addCateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options：数据源 -->
          <!-- props：指定配置对象 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              clearable
              filterable
              style="width: 100%"
              @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog :visible.sync="editCateDialogVisible" title="编辑分类" width="50%">
      <el-form
          ref="editCateFormRef"
          :model="editCateForm"
          :rules="editCateFormRules"
          label-width="100px"
      >
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="editCateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="备注：" prop="note">
          <el-input v-model="editCateForm.note"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options：数据源 -->
          <!-- props：指定配置对象 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              clearable
              filterable
              style="width: 100%"
              @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodCategories',
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 查询条件
      queryInfo: {
        page: {
          current: 1,
          size: 5
        }
      },
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'name'
        },
        {
          label: '备注',
          // 当前列 自定义模板
          type: 'template',
          template: 'note'
        },
        {
          label: '排序',
          // 当前列 自定义模板
          type: 'template',
          template: 'level'
        },{
          label: '创建时间',
          // 当前列 自定义模板
          type: 'template',
          template: 'createTime'
        },{
          label: '更新时间',
          // 当前列 自定义模板
          type: 'template',
          template: 'updateTime'
        },
        {
          label: '操作',
          // 当前列 自定义模板
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类
      addCateDialogVisible: false,
      // 添加分类对象
      addCateForm: {
        // 将要添加分类名称
        name: '',
        // 分类父级id
        parent: 0,
        // 分类等级：`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        level: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 配置触发选项 hover/click
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: 'true'

      },
      // 选中的父级Id数组
      selectedKeys: [],
      // 编辑对话框 控制
      editCateDialogVisible: false,
      // 编辑分类表单验证
      editCateFormRules: {
        name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      // 编辑表单 绑定对象
      editCateForm: {
        parent: "",
        name: '',
        note: '',
        level: '',
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const {data: res} = await this.$http.post('http://localhost:8085/good/category/page', {
        page: this.queryInfo.page
      })
      if (!res.status) {
        return this.$message.error('获取商品分类失败！')
      }
      // 给数据列表赋值
      this.cateList = res.page.records
      // 总数据条数
      this.total = res.page.total
    },
    // 监听 pageSizeChange
    handleSizeChange(newSize) {
      this.queryInfo.page.size = newSize
      this.getCateList()
    },
    // 监听 pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.page.current = newPage
      this.getCateList()
    },
    // 添加操作
    showAddCateDialog() {
      // 先获取父级分类数据
      this.getParentCateList()
      // 再打开对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据
    async getParentCateList() {
      const {data: res} = await this.$http.post('http://localhost:8085/good/category/page', {
        page: {
          size: 1000,
          current: 1
        }
      })
      if (!res.status) {
        return this.$message.error('获取父级分类失败！')
      }
      this.parentCateList = res.page.records
      this.parentCateList.unshift({name: "根", parent: 0, level: 0})

    },
    // 添加分类 选择项发生变化触发
    parentCateChanged() {
      // 如何selectKeys 数组的长度>0 说明选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.parent = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级
        this.addCateForm.level = this.selectedKeys.length
        this.editCateForm.level = this.selectedKeys.length
        this.editCateForm.parent = this.addCateForm.parent
        return 0
      } else {
        // 父级分类的Id
        this.addCateForm.parent = 0
        // 当前分类的等级
        this.addCateForm.level = 0
      }
    },

    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('http://localhost:8085/good/category/insert', this.addCateForm)
        if (!res.status) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加分类 重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.level = 0
      this.addCateForm.parent = 0
    },
    // 删除分类
    async removeCate(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const {data: res} = await this.$http.get('http://localhost:8085/good/category/delete/' + id)
      if (!res.status) {
        return this.$message.error('删除商品分类失败！')
      }
      this.$message.success('删除商品分类成功！')
      this.getCateList()
    },
    // 显示编辑对话框
    async showEditCateDialog(id) {
      const {data: res} = await this.$http.get('http://localhost:8085/good/category/' + id)
      if (!res.status) return this.$message.error('获取分类失败！')
      await this.getParentCateList()
      this.editCateForm = res.data
      this.selectedKeys = this.editCateForm.parent
      this.editCateDialogVisible = true
    },
    // 编辑分类名
    eidtCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('http://localhost:8085/good/category/updateById',
            {
              id: this.editCateForm.id,
              name: this.editCateForm.name,
              parent: this.editCateForm.parent,
              note: this.editCateForm.not,
              level: this.editCateForm.level
            })
        if (!res.status) return this.$message.error('更新分类名失败！')
        this.$message.success('更新分类名成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    }
  }
}
</script>

<style lang='less' scoped>
.treeTable {
  margin-top: 20px;
}
.ed-op{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

}
// .el-cascader {
//   width: 100%;
// }
</style>
