<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="queryInfo.query" clearable placeholder="请输入内容" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="goodsList" border stripe :default-sort="{prop: 'createTime', order: 'descending'}" >
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goodName" show-overflow-tooltip></el-table-column>
        <el-table-column label="商品价格(元)" prop="goodPrice.price"></el-table-column>
        <el-table-column label="商品介绍"  show-overflow-tooltip type="expand">
          <template slot-scope="props">
            <label v-html="props.row.goodDetail.goodIntroduce">
          </label>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" prop="stoke" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="140px">
          <template slot-scope="scope">{{ scope.row.createTime | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary"></el-button>
            <el-button
                icon="el-icon-delete"
                size="mini"
                type="danger"
                @click="removeById(scope.row.id)"
            ></el-button>
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
  </div>
</template>

<script>
export default {
  name: "GoodList",
  data() {
    return {
      queryInfo: {
        query: "",
        page: {
          current: 1,
          size: 10
        }
      },
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const {data, status} = await this.$http.post('/good/page', {
        goodName: this.queryInfo.query,
        queryType: "like",//模糊查询
        page: this.queryInfo.page
      })
      if (status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsList = data.page.records
      this.total = data.page.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newSize) {
      this.queryInfo.page.current = newSize
      this.getGoodsList()
    },
    // 通过Id删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该商品, 是否继续?',
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
      const {data: res} = await this.$http.get('/good/delete/' + id)
      if (!res.status) {
        return this.$message.error(res.message)
      }
      this.$message.success(res.message)
      this.getGoodsList()
    },
    goAddPage() {
      this.$router.push('/goods/add')
    }
  },
  computed: {
    introduce() {
      return this.showGoodIntroduce()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
