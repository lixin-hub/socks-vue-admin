<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示 -->
      <el-alert :closable="false" center show-icon title="添加商品信息" type="info"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" :space="200" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab栏 -->
      <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-position="top"
          label-width="100px"
      >
        <el-tabs
            v-model="activeIndex"
            :before-leave="beforeTabLeave"
            :tab-position="'left'"
            @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goodName">
              <el-input v-model="addForm.goodName"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goodPrice">
              <el-input v-model="addForm.goodPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goodStoke">
              <el-input v-model="addForm.goodStoke" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goodCat">
              <el-cascader
                  v-model="addForm.goodCat"
                  :options="cateList"
                  :props="cascaderProps"
                  clearable
                  filterable
                  @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                      <!-- 渲染表单的Item项 -->
                      <el-form-item
                          v-for="item in manyTableData
                      "
                          :key="item.id"
                          :label="item.name"
                      >
                        <!-- 复选框组 -->
                        <el-checkbox-group v-model="item.value">
                          <el-checkbox :label="cb" v-for="(cb, i) in item.value" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                      </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                      <el-form-item :label="item.name" v-for="item in onlyTableData" :key="item.id">
                        <el-input v-model="item.value"></el-input>
                      </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                      <!-- action: 图片上传的API接口地址 -->
                      <el-upload
                          :limit="20"
                          :action="uploadURL"
                          :on-preview="handlePreview"
                          :on-remove="handleRemove"
                          :headers="headerObj"
                          list-type="picture"
                          :on-success="handleSuccess"
                      >
                        <el-button size="small" type="primary">点击上传</el-button>
                      </el-upload>
                    </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goodIntroduce"></quill-editor>
            <!-- 添加商品 -->
            <el-button class="btnAdd" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog :visible.sync="previewDialogVisible" title="图片预览" width="50%">
      <img :src="picPreviewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'AddGood',
  data() {
    return {
      // 步骤条默认激活 与左侧Tab联动
      activeIndex: '0',
      // 添加商品的表单对象
      addForm: {
        goodName: '',
        goodPrice: 0,
        goodStoke: 0,//库存
        // 商品所属分类数组
        goodCat: [],
        // 图片的数组
        pics: [],
        // 商品详情描述
        goodsIntroduce: '',
        attrs: []
      },
      addFormRules: {
        goodName: [
          {required: true, message: '请输入商品名称', trigger: 'blur'}
        ],
        goodsPrice: [
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goodStoke: [
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ],
        goodCat: [
          {required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      // 商品列表
      cateList: [],
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'name',
        value: 'id',
        children: 'children',
        checkStrictly: 'true'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片上传地址
      uploadURL: 'http://42.193.22.5:10010/file/upload/static',
      // 图片上传组件的请求对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      picPreviewPath: '',
      // 图片预览对话框
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    getCateId() {
      if (this.addForm.goodCat.length >0) {
        return this.addForm.goodCat[this.addForm.goodCat.length-1]
      }
      return null
    }
  },
  methods: {
    // 获取商品分类数据列表
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
    // 级联选择器选中项变化时出发
    handleChange() {
      // console.log(this.addForm.goodCat)
      // if (this.addForm.goodCat.length !== 3) {
      //   this.addForm.goodCat = []
      // }
    },
    beforeTabLeave(activeName, odlActiveName) {
      // 未选中商品分类阻止Tab标签跳转
      if (odlActiveName === '0' && this.addForm.goodCat.length === 0) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // Tab标签被选中时触发
    async tabClicked() {
      // 访问动态参数面板
      if (this.activeIndex === '1') {
        const {data: res} = await this.$http.get(
            `/good/attribute/0/${this.getCateId}/list`,
        )
        if (!res.status) {
          return this.$message.error(res.meta.message||res.message)
        }
        res.data.forEach(item => {
          item.value =
              item.value.length === 0 ? [] : item.value.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const {data: res} = await this.$http.get(
            `/good/attribute/1/${this.getCateId}/list`,
        )
        if (!res.status) {
          return this.$message.error(res.meta.message||res.message)
        }
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览
    handlePreview(file) {
      this.picPreviewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用splice方法，移除图片信息
      this.addForm.splice(i, 1)
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      this.addForm.pics.push(response.ossFilePath)
      console.log(this.addForm.pics)
    },
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 发送请求前：需对提交的表单进行处理goods_cat attrs
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        // 以上写法不对：级联选择器绑定的对象goods_cat要求是数组对象
        // 解决办法: 包：lodash 方法（深拷贝）：cloneDeep(boj)

        // 将this.addForm进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goodCat = form.goodCat.join(',')

        // 处理参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attrId: item.id,
            attrValue: item.value.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attrId: item.id,
            attrValue: item.value
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求添加商品
        // 商品名称必须是唯一的
        const {data: res} = await this.$http.post('/good/addGoodInfo', form)
        if (!res.status) {
          console.log(res.data)
          return this.$message.error(res.message)
        }
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px
}
</style>
