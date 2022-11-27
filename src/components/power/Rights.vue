<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加权限按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddPermissionDialog">添加权限</el-button>
        </el-col>
      </el-row>
      <tree-table
          :columns="columns"
          :data="rightsList"
          :expand-type="false"
          :selection-type="false"
          :show-row-hover="false"
          :stripe="true"
          :tree-type="true"
          border
          class="treeTable"
          index-text="#"
          show-index
      >
        <!--名称 -->
        <template slot="description" slot-scope="scope">
          <label>{{ scope.row.description }}</label>
        </template>
        <!-- 备注 -->
        <template slot="note" slot-scope="scope">
          <label>{{ scope.row.note }}</label>
        </template>
        <template slot="permission" slot-scope="scope">
          <label>{{ scope.row.permission }}</label>
        </template>
        <!-- 排序 -->
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.level === '0'" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.level === '1'" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <template slot="createTime" slot-scope="scope">
          <label>{{ scope.row.createTime | dataFormat }}</label>
        </template>
        <template slot="updateTime" slot-scope="scope">
          <label>{{ scope.row.updateTime|dataFormat }}</label>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <div class="ed-op">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditPermissionDialog(scope.row.id)">编辑
            </el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removePermission(scope.row.id)">删除
            </el-button>
          </div>
        </template>
      </tree-table>
    </el-card>
    <!--     分页区域 -->
    <el-pagination
        :current-page="queryInfo.current"
        :page-size="queryInfo.size"
        :page-sizes="[5, 10, 15, 20]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    ></el-pagination>
    <!-- 添加对话框 -->
    <el-dialog :visible.sync="addPermissionDialogVisible" title="添加权限" width="50%" @close="addPermissionDialogClosed">
      <el-form
          ref="addPermissionFormRef"
          :model="addPermissionForm"
          :rules="addPermissionFormRules"
          label-width="120px"
      >
        <el-form-item label="权限名称：" prop="description">
          <el-input v-model="addPermissionForm.description"></el-input>
        </el-form-item>
        <el-form-item label="权限字符串：" prop="permission">
          <el-input v-model="addPermissionForm.permission"></el-input>
        </el-form-item>
        <el-form-item label="备注：" prop="note">
          <el-input v-model="addPermissionForm.note"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options：数据源 -->
          <!-- props：指定配置对象 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentPermissionList"
              :props="cascaderProps"
              clearable
              filterable
              style="width: 100%"
              @change="parentPermissionChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
            <el-button @click="addPermissionDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addPermission">确 定</el-button>
          </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="editPermissionDialogVisible" title="编辑分类" width="50%">
      <el-form
          ref="editPermissionFormRef"
          :model="editPermissionForm"
          :rules="editPermissionFormRules"
          label-width="120px"
      >
        <el-form-item label="权限名称：" prop="description">
          <el-input v-model="editPermissionForm.description"></el-input>
        </el-form-item>
        <el-form-item label="权限字符串：" prop="permission">
          <el-input v-model="editPermissionForm.permission"></el-input>
        </el-form-item>
        <el-form-item label="备注：" prop="note">
          <el-input v-model="editPermissionForm.note"></el-input>
        </el-form-item>
        <el-form-item label="父级权限：">
          <!-- options：数据源 -->
          <!-- props：指定配置对象 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentPermissionList"
              :props="cascaderProps"
              clearable
              filterable
              style="width: 100%"
              @change="parentPermissionChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPermissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtPermission">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyRight',
  data() {
    return {
      // 权限列表
      rightsList: [],
      // 查询参数
      queryInfo: {
        query: '',
        current: 1,
        size: 10
      },
      total: 0,
      // 选中的父级Id数组
      selectedKeys: [],
      columns: [

        {
          label: '权限名称',
          prop: 'description'
        },
        {
          label: '权限字符串',
          // 当前列 自定义模板
          type: 'template',
          template: 'permission'
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
        }, {
          label: '创建时间',
          // 当前列 自定义模板
          type: 'template',
          template: 'createTime'
        }, {
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
        },

      ],
      // 编辑表单的验证规则
      editPermissionFormRules: {
        description: [{required: true, message: '请输入权限名称', trigger: 'blur'},],
        permission: [{required: true, message: '请输入权限字符串', trigger: 'blur'},],
        note: [{required: false, message: '请输入备注', trigger: 'blur'},],
      },
      addPermissionFormRules: {
        description: [{required: true, message: '请输入权限名称', trigger: 'blur'},],
        permission: [{required: true, message: '请输入权限字符串', trigger: 'blur'},],
        note: [{required: false, message: '请输入备注', trigger: 'blur'},],
        parent: [{required:false , message: '请输入父权限', trigger: 'blur'},],
      },
      editPermissionDialogVisible: false,
      addPermissionDialogVisible:false,

      editPermissionForm: {
        description: '',
        note: '',
        permission: '',
        parent: '',
        level: ''
      },
      addPermissionForm: {
        description: '',
        note: '',
        permission: '',
        parent: '',
        level: ''
      },
      parentPermissionList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 配置触发选项 hover/click
        expandTrigger: 'hover',
        value: 'id',
        label: 'description',
        children: 'children',
        checkStrictly: 'true'

      },
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      let page = await this.getPermissionTreePage( {
        size: this.queryInfo.size,
        current: this.queryInfo.current
      });
      this.rightsList = page.records
      this.total = page.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.getRightsList()
    },
    handleCurrentChange(newSize) {
      this.queryInfo.current = newSize
      this.getRightsList()
    },
    // 添加权限 重置表单
    addPermissionDialogClosed() {
      this.$refs.addPermissionFormRef.resetFields()
      this.selectedKeys = []
      this.addPermissionForm.level = 0
      this.addPermissionForm.parent = 0
    },
    // 删除分类
    async removePermission(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const {data: res} = await this.$http.get('/sys/perm/delete/' + id)
      if (!res.status) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      this.getRightsList()

    },
    // 显示编辑对话框
    async showEditPermissionDialog(id) {
      const {data: res} = await this.$http.get('/sys/perm/selectById/' + id)
      if (!res.status) return this.$message.error('获取权限失败！')
      this.editPermissionForm = res.data
      let page = await this.getPermissionTreePage( {
        size: 200,
        current: 1
      });
      this.parentPermissionList = page.records
      this.selectedKeys = this.editPermissionForm.parent
      this.editPermissionDialogVisible = true
    },
    async showAddPermissionDialog(){
      this.addPermissionDialogVisible=true;
      let page =await this.getPermissionTreePage({
        size: 200,
        current: 1
      });
      this.parentPermissionList=page.records
    },
    // 提交编辑
    eidtPermission() {
      this.$refs.editPermissionFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('/sys/perm/updateById',
            this.editPermissionForm)
        if (!res.status) return this.$message.error('更新失败！')
        this.$message.success('更新成功！')
        this.editPermissionDialogVisible = false
        this.getRightsList()
      })
    },
    async addPermission() {
      this.$refs.addPermissionFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('/sys/perm/insert', this.addPermissionForm)
        if (!res.status) {
          return this.$message.error('添加权限失败！')
        }
        this.$message.success('添加权限成功！')
        this.addPermissionDialogVisible = false
        await this.getRightsList()
      })
    },
    parentPermissionChanged() {
      // 如何selectKeys 数组的长度>0 说明选中父级分类
      if (this.selectedKeys.length > 0) {
        console.log(this.selectedKeys)
        // 父级Id
        this.addPermissionForm.parent = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前的等级
        this.addPermissionForm.level = this.selectedKeys.length
        this.editPermissionForm.level = this.selectedKeys.length
        this.editPermissionForm.parent = this.addPermissionForm.parent
        return 0
      } else {
        // 父级分类的Id
        this.addPermissionForm.parent = 0
        // 当前分类的等级
        this.addPermissionForm.level = 0
      }
    },
    async getPermissionTreePage(page) {
      let parent = '0'
      const {data: res} = await this.$http.post('/sys/perm/tree', {
        parent,
        page
      })
      if (!res.status) {
        return this.$message.error('获取权限列表失败！')
      }
      return res.page
    },

  },


}
</script>

<style lang='less' scoped>
.ed-op {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
</style>
