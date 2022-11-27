<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
                v-for="(item1, i1) in scope.row.permissions"
                :key="item1.id"
                :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.description }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级 -->
              <el-col :span="19">
                <!-- 通过for循环 渲染二级权限 -->
                <el-row
                    v-for="(item2, i2) in item1.children"
                    :key="item2.id"
                    :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6 ">
                    <el-tag
                        closable
                        type="success"
                        @close="removeRightById(scope.row, item2.id)"
                    >{{ item2.description }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                        v-for="(item3) in item2.children"
                        :key="item3.id"
                        closable
                        type="warning"
                        @close="removeRightById(scope.row, item3.id)"
                    >{{ item3.description }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="description"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeRoleById(scope.row.id)">删除
            </el-button>
            <el-button
                icon="el-icon-setting"
                size="mini"
                type="warning"
                @click="showSetRightDialog(scope.row)"
            >分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
          :current-page="queryInfo.page.current"
          :page-size="queryInfo.page.size"
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog
        :visible.sync="setRightDialogVisible"
        title="分配权限"
        width="50%"
        @close="setRightDialogClosed"
    >
      <el-tree
          ref="treeRef"
          :data="rightsList"
          :default-checked-keys="defKeys"
          :props="treeProps"
          default-expand-all
          node-key="id"
          show-checkbox
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog :visible.sync="AddRoleDialogVisible" title="添加角色" width="40%" @close="addRoleDialogClosed">
      <el-form
          ref="addRoleFormRef"
          :model="addRoleForm"
          :rules="addRoleFormRules"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="addRoleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog :visible.sync="editRoleDialogVisible" title="编辑角色" width="40%" @close="addRoleDialogClosed">
      <el-form
          ref="editRoleFormRef"
          :model="editRoleForm"
          :rules="editRoleFormRules"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="editRoleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyRoles',
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 分配权限框
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      //  树形控件的属性绑定对象
      treeProps: {
        label: 'description',
        children: 'children'
      },
      //   默认选中节点ID值
      defKeys: [],
      queryInfo: {
        page: {
          size: 10,
          current: 1
        }
      },
      //   添加用户对话框
      AddRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {},
      //   添加角色表单验证
      addRoleFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },
      //   编辑角色信息
      editRoleForm: {
        id: '',
        description: '',
        roleName: ''
      },
      editRoleDialogVisible: false,
      editRoleFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'}
        ]
      },
      //   当前即将分配权限的Id
      roleId: 0,
      total: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data: res} = await this.$http.post('/sys/role/tree', this.queryInfo)
      if (!res.status) {
        return this.$message.error(res.message)
      }
      this.rolesList = res.page.records
      this.total = res.page.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.getRolesList()
    },
    handleCurrentChange(newSize) {
      this.queryInfo.page.current = newSize
      this.getRolesList()
    },
    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示 删除
      const confirmResult = await this.$confirm(
          '此操作将永久删除该权限, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消权限删除')
      }
      const {data: res} = await this.$http.get(`sys/role/${role.id}/remove/${rightId}`)
      if (!res.status) {
        return this.$message.error('删除权限失败！')
      }
      console.log(res.data)
      this.$set(role, `permissions`, res.data)
      //   不建议使用
      // this.getRolesList()
    },
    // 分配权限
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取角色的所有权限
      let page = await this.getPermissionTree()
      //   获取权限树
      this.rightsList = page.records
      //   递归获取三级节点的id
      console.log(role)
      this.getLeafkeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归 获取角色下三级权限的 id, 并保存到defKeys数组
    getLeafkeys(node, arr) {
      // 没有children属性，则是三级节点
      if (!node.permissions && !node.children) {
        return arr.push(node.id)
      }
      if (node.permissions) {
        node.permissions.forEach(item => this.getLeafkeys(item, arr))
      } else {
        node.children.forEach(item => this.getLeafkeys(item, arr))
      }
    },
    // 权限对话框关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 添加角色对话框的关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRoles() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('/sys/role/insert', this.addRoleForm)
        if (res.status) {
          this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.AddRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.get('/sys/role/delete/' + id)
      if (!res.status) return this.$message.error('删除角色失败！')
      this.$message.success('删除用户成功！')
      this.getRolesList()
    },
    // 编辑角色
    async showEditDialog(id) {
      const {data: res} = await this.$http.get('/sys/role/selectById/' + id)
      if (!res.status) return this.$message.error('查询角色信息失败！')
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    editRoles() {
      this.$refs.editRoleFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const {data: res} = await this.$http.post('/sys/role/updateById', this.editRoleForm)
        if (!res.status) {
          this.$message.error('更新角色信息失败！')
        }
        // 隐藏编辑角色对话框
        this.editRoleDialogVisible = false
        this.$message.success('更新角色信息成功！')
        this.getRolesList()
      })
    },
    // 分配权限
    // eslint-disable-next-line no-unused-vars
    async allotRights(roleId) {
      // 获得当前选中和半选中的Id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // join() 方法用于把数组中的所有元素放入一个字符串
      const idStr = keys.join(',')
      const {data: res} = await this.$http.get(`/sys/role/${this.roleId}/malloc/${idStr}`)
      if (!res.status) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    async getPermissionTree() {
      // const {data: res} = await this.$http.get(`/sys/perm/${roleId}/tree`)
      const {data: res} = await this.$http.post('/sys/perm/tree', {
        parent: "0",
        page: {
          size: 200, current: 1
        }
      })
      if (!res.status) {
        return this.$message.error('获取权限列表失败！')
      }
      return res.page
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
